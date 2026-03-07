import { InvoiceStatus, ClientInvoice, InterpreterInvoice } from '../../../types';

export interface BillingRepository {
    getClientInvoices(statusFilter?: InvoiceStatus): Promise<ClientInvoice[]>;
    getClientInvoiceById(id: string): Promise<ClientInvoice | null>;
    updateClientInvoiceStatus(id: string, status: InvoiceStatus): Promise<void>;

    getInterpreterInvoices(statusFilter?: InvoiceStatus): Promise<InterpreterInvoice[]>;
    getInterpreterInvoiceById(id: string): Promise<InterpreterInvoice | null>;
    updateInterpreterInvoiceStatus(id: string, status: InvoiceStatus): Promise<void>;

    getDashboardStats(): Promise<any>;
}
