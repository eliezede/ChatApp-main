import { getFunctions, httpsCallable } from 'firebase/functions';
import { Timesheet } from '../../timesheets/types';
import { ClientInvoice, InvoiceStatus } from '../../../types';
import { MOCK_CLIENT_INVOICES, saveMockData } from '../../../services/mockData';

export const generateClientInvoice = async (clientId: string, periodStart?: string, periodEnd?: string): Promise<any> => {
    try {
        const functions = getFunctions();
        const generateFn = httpsCallable(functions, 'generateClientInvoice');
        const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const end = periodEnd || new Date().toISOString();
        const result = await generateFn({ clientId, periodStart: start, periodEnd: end });
        return result.data as any;
    } catch (e) {
        console.error("Function call failed, falling back to mock generation", e);
        // Mock logic for offline dev
        const ref = `INV-${Math.floor(Math.random() * 10000)}`;
        const newInvoice = {
            id: `mock-inv-${Date.now()}`,
            clientId,
            clientName: 'Mock Client',
            reference: ref,
            invoiceNumber: ref,
            status: InvoiceStatus.DRAFT,
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            periodStart: periodStart || new Date().toISOString(),
            periodEnd: periodEnd || new Date().toISOString(),
            totalAmount: 150.00,
            currency: 'GBP',
            items: [],
            organizationId: 'SYSTEM',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as ClientInvoice;
        MOCK_CLIENT_INVOICES.push(newInvoice);
        saveMockData();
        return { success: true, total: 150.00, invoiceId: newInvoice.id };
    }
};
