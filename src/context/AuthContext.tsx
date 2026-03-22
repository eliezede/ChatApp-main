
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean; // true for both ADMIN and SUPER_ADMIN
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Attempt to fetch user role data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.email,
              role: userData.role as UserRole,
              profileId: userData.profileId,
              status: userData.status || 'ACTIVE'
            });
          } else {
            // BACKUP: Fetch by email if UID document doesn't exist
            // (Handles legacy mismatch or transition periods)
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', firebaseUser.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              console.log("Auth: Found user by email fallback.", userData);
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: userData.displayName || firebaseUser.email,
                role: userData.role as UserRole,
                profileId: userData.profileId,
                status: userData.status || 'ACTIVE'
              });
              
              // MIGRATION: Auto-align document ID with UID
              const { setDoc, deleteDoc } = await import('firebase/firestore');
              await setDoc(doc(db, 'users', firebaseUser.uid), userData);
              await deleteDoc(querySnapshot.docs[0].ref);
              console.log("Auth: ID migration successful.");
            } else {
              // No profile doc exists at all
              // Check mock data as fallback before creating default
            const mockUser = MOCK_USERS.find(u => u.email === firebaseUser.email);

            /* Fixed: Added missing required status property to User object */
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: mockUser?.displayName || firebaseUser.displayName || 'User',
              role: mockUser?.role || UserRole.CLIENT, // Default to CLIENT if unknown
              profileId: mockUser?.profileId,
              status: mockUser?.status || 'ACTIVE'
            });
          }
        }
      } catch (error) {
        console.warn("Auth: Firestore unreachable (Offline Mode). Using Mock Data fallback.");

          // OFFLINE FALLBACK: Match email to Mock Data
          const mockUser = MOCK_USERS.find(u => u.email === firebaseUser.email);

          if (mockUser) {
            setUser({
              ...mockUser,
              id: firebaseUser.uid // Keep the real auth UID
            });
          } else {
            // Fallback for unknown users in offline mode
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Offline User',
              role: UserRole.INTERPRETER,
              status: 'PENDING'
            });
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  return (
    <AuthContext.Provider value={{
      user,
      logout,
      isLoading,
      isAuthenticated: !!user,
      isSuperAdmin,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
