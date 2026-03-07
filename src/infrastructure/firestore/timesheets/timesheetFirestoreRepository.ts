import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { TimesheetRepository } from '../../../domains/timesheets/repository';
import { Timesheet, TimesheetStatus } from '../../../domains/timesheets/types';
import { MOCK_TIMESHEETS, saveMockData } from '../../../services/mockData';

export const createTimesheetFirestoreRepository = (tenantId: string): TimesheetRepository => ({
    async getById(id: string): Promise<Timesheet | null> {
        try {
            const snap = await getDoc(doc(db, 'timesheets', id));
            if (snap.exists()) {
                const data = snap.data() as Timesheet;
                if (data.organizationId !== tenantId) return null; // Guardrail
                return { id: snap.id, ...data };
            }
        } catch { /* mock fallback */ }
        const mock = MOCK_TIMESHEETS.find((t: any) => t.id === id) as any;
        if (mock && mock.organizationId === tenantId) return mock;
        return null;
    },

    async create(data): Promise<Timesheet> {
        const tsWithTenant = { ...data, organizationId: tenantId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
        try {
            const ref = await addDoc(collection(db, 'timesheets'), tsWithTenant);
            return { id: ref.id, ...(tsWithTenant as any) };
        } catch {
            const mockTs = { id: `ts-${Date.now()}`, ...tsWithTenant } as any;
            MOCK_TIMESHEETS.push(mockTs);
            saveMockData();
            return mockTs;
        }
    },

    async update(id, data): Promise<void> {
        const ts = await this.getById(id);
        if (!ts) throw new Error('Timesheet not found or unauthorized'); // Guardrail

        try {
            await updateDoc(doc(db, 'timesheets', id), { ...data, updatedAt: serverTimestamp() });
        } catch {
            const tMock = MOCK_TIMESHEETS.find((t: any) => t.id === id);
            if (tMock) Object.assign(tMock, data);
            saveMockData();
        }
    },

    async updateStatus(id, newStatus): Promise<void> {
        await this.update(id, { status: newStatus as TimesheetStatus });
    },

    async findByInterpreter(interpreterId: string): Promise<Timesheet[]> {
        try {
            const q = query(collection(db, 'timesheets'),
                where('organizationId', '==', tenantId), // Guardrail
                where('interpreterId', '==', interpreterId));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Timesheet));
        } catch {
            return MOCK_TIMESHEETS.filter((t: any) => t.organizationId === tenantId && t.interpreterId === interpreterId) as any;
        }
    },

    async findPendingApproval(): Promise<Timesheet[]> {
        try {
            const q = query(collection(db, 'timesheets'),
                where('organizationId', '==', tenantId), // Guardrail
                where('status', '==', 'SUBMITTED'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Timesheet));
        } catch {
            return MOCK_TIMESHEETS.filter((t: any) => t.organizationId === tenantId && t.status === 'SUBMITTED') as any;
        }
    }
});
