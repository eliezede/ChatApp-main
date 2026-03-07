import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { UserRepository, UserSnapshot } from '../../../domains/users/repository';
import { MOCK_USERS } from '../../../services/mockData';

export const userFirestoreRepository: UserRepository = {
    async getByProfileId(profileId: string): Promise<UserSnapshot | null> {
        try {
            const q = query(collection(db, 'users'), where('profileId', '==', profileId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const d = snap.docs[0];
                return { id: d.id, ...(d.data() as any) } as UserSnapshot;
            }
        } catch { /* fallback to mock */ }

        const mockUser = MOCK_USERS.find(u => u.profileId === profileId);
        if (mockUser) {
            return { id: mockUser.id, email: mockUser.email, displayName: mockUser.displayName };
        }
        return null;
    }
};
