import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { User } from '../types';
import { MOCK_USERS, saveMockData } from './mockData';
import { convertDoc, safeFetch } from './utils';

export const UserService = {
  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const docRef = doc(db, 'users', id);
      const snap = await getDoc(docRef);
      return snap.exists() ? convertDoc<User>(snap) : MOCK_USERS.find(u => u.id === id);
    } catch (e) {
      return MOCK_USERS.find(u => u.id === id);
    }
  },

  getAll: async (): Promise<User[]> => {
    return safeFetch(async () => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => convertDoc<User>(d));
    }, MOCK_USERS);
  },

  update: async (id: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', id), data);
    } catch (e) { 
      const idx = MOCK_USERS.findIndex(u => u.id === id);
      if (idx !== -1) {
        MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data } as User;
        saveMockData();
      }
    }
  },

  delete: async (id: string) => {
    // 1. Sync Mock Data first to ensure consistent state
    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx !== -1) {
      MOCK_USERS.splice(idx, 1);
      saveMockData();
    }

    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      console.warn('Firebase user deletion failed', e);
    }
  },

  rigorousDelete: async (user: User) => {
    // Determine and cleanup associated profile based on role
    try {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        const { StaffService } = await import('./staffService');
        await StaffService.deleteProfileByUserId(user.id);
      } else if (user.role === 'INTERPRETER') {
        const { InterpreterService } = await import('./interpreterService');
        if (user.profileId) await InterpreterService.delete(user.profileId);
      } else if (user.role === 'CLIENT') {
        const { ClientService } = await import('./clientService');
        if (user.profileId) await ClientService.delete(user.profileId);
      }
    } catch (e) {
      console.warn('Error during rigorous profile cleanup:', e);
    }

    // Finally delete the main user record
    await UserService.delete(user.id);
  },

  create: async (data: Omit<User, 'id'>) => {
    try {
      const newDocRef = doc(collection(db, 'users'));
      const userData = { ...data, status: data.status || 'ACTIVE' };
      await setDoc(newDocRef, userData);
      return { id: newDocRef.id, ...userData };
    } catch (e) { 
      const mockUser = { id: `mock-u-${Date.now()}`, ...data, status: data.status || 'ACTIVE' } as User;
      MOCK_USERS.push(mockUser);
      saveMockData();
      return mockUser;
    }
  },

  sendActivationEmail: async (email: string) => {
    try {
      // In a production environment, this triggers a standard Firebase password reset.
      // This will now only work if the user has already been provisioned by the backend.
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      console.error("Error sending activation email:", e);
      throw e;
    }
  }
};