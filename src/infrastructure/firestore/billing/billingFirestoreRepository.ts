import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { BillingRepository } from '../../../domains/billing/repository';
import { InvoiceStatus, ClientInvoice, InterpreterInvoice } from '../../../types';
import { MOCK_CLIENT_INVOICES, MOCK_INTERPRETER_INVOICES, saveMockData } from '../../../services/mockData';

export const createBillingFirestoreRepository = (tenantId: string): BillingRepository => ({
    async getClientInvoices(statusFilter?: InvoiceStatus): Promise<ClientInvoice[]> {
        try {
            let q = query(collection(db, 'client_invoices'), where('organizationId', '==', tenantId));
            if (statusFilter) {
                q = query(q, where('status', '==', statusFilter));
            }
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientInvoice));
        } catch {
            let mocks = MOCK_CLIENT_INVOICES.filter(i => i.organizationId === tenantId);
            if (statusFilter) mocks = mocks.filter(i => i.status === statusFilter);
            return mocks as any;
        }
    },

    async getClientInvoiceById(id: string): Promise<ClientInvoice | null> {
        try {
            const snap = await getDoc(doc(db, 'client_invoices', id));
            if (snap.exists()) {
                const data = snap.data() as ClientInvoice;
                if (data.organizationId !== tenantId) return null; // Guardrail
                const { id: _, ...rest } = data;
                return { id: snap.id, ...rest } as ClientInvoice;
            }
        } catch { /* mock fallback */ }
        const mock = MOCK_CLIENT_INVOICES.find(i => i.id === id);
        if (mock && mock.organizationId === tenantId) return mock as any;
        return null;
    },

    async updateClientInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
        const inv = await this.getClientInvoiceById(id);
        if (!inv) throw new Error('Invoice not found or unauthorized');

        try {
            await updateDoc(doc(db, 'client_invoices', id), { status });
        } catch {
            const i = MOCK_CLIENT_INVOICES.find(i => i.id === id);
            if (i) i.status = status;
            saveMockData();
        }
    },

    async getInterpreterInvoices(statusFilter?: InvoiceStatus): Promise<InterpreterInvoice[]> {
        try {
            let q = query(collection(db, 'interpreter_invoices'), where('organizationId', '==', tenantId));
            if (statusFilter) {
                q = query(q, where('status', '==', statusFilter));
            }
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as InterpreterInvoice));
        } catch {
            let mocks = MOCK_INTERPRETER_INVOICES.filter(i => i.organizationId === tenantId);
            if (statusFilter) mocks = mocks.filter(i => i.status === statusFilter);
            return mocks as any;
        }
    },

    async getInterpreterInvoiceById(id: string): Promise<InterpreterInvoice | null> {
        try {
            const snap = await getDoc(doc(db, 'interpreter_invoices', id));
            if (snap.exists()) {
                const data = snap.data() as InterpreterInvoice;
                if (data.organizationId !== tenantId) return null; // Guardrail
                const { id: _, ...rest } = data;
                return { id: snap.id, ...rest } as InterpreterInvoice;
            }
        } catch { /* mock fallback */ }
        const mock = MOCK_INTERPRETER_INVOICES.find(i => i.id === id);
        if (mock && mock.organizationId === tenantId) return mock as any;
        return null;
    },

    async updateInterpreterInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
        const inv = await this.getInterpreterInvoiceById(id);
        if (!inv) throw new Error('Invoice not found or unauthorized');

        try {
            await updateDoc(doc(db, 'interpreter_invoices', id), { status });
        } catch {
            const i = MOCK_INTERPRETER_INVOICES.find(i => i.id === id);
            if (i) i.status = status;
            saveMockData();
        }
    },

    async getDashboardStats(): Promise<any> {
        // In a real app, calculate from tenant-secured collections
        return {
            totalClientOutstanding: 1540.00,
            totalInterpreterPayable: 850.00,
            monthlyProfit: 690.00
        };
    }
});
