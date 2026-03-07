import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { InterpreterRepository, InterpreterSnapshot } from '../../../domains/interpreters/repository';
import { MOCK_INTERPRETERS } from '../../../services/mockData';

export const interpreterFirestoreRepository: InterpreterRepository = {
    async getSnapshotById(id: string): Promise<InterpreterSnapshot | null> {
        try {
            const snap = await getDoc(doc(db, 'interpreters', id));
            if (snap.exists()) {
                const data = snap.data();
                return { id: snap.id, name: data.name, email: data.email };
            }
        } catch { /* fallback to mock */ }

        const mockInt = MOCK_INTERPRETERS.find(i => i.id === id);
        if (mockInt) {
            return { id: mockInt.id, name: mockInt.name, email: mockInt.email };
        }
        return null;
    }
};
