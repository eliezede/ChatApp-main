import { Timesheet } from '../../timesheets/types';
import { InterpreterInvoice, InvoiceStatus } from '../../../types';
import { MOCK_INTERPRETER_INVOICES, MOCK_TIMESHEETS, saveMockData } from '../../../services/mockData';

export const generateInterpreterPayment = async (
    interpreterId: string,
    timesheets: Timesheet[],
    ref: string,
    amount: number
): Promise<InterpreterInvoice> => {
    // Architectural rule: enforce timesheets are approved
    const unapproved = timesheets.filter(ts => !ts.adminApproved || ts.status !== 'APPROVED');
    if (unapproved.length > 0) {
        throw new Error('Cannot generate payment: One or more timesheets are not approved.');
    }

    // Mock Implementation migrated from billingService
    const newInvoice: InterpreterInvoice = {
        id: `inv-i-${Date.now()}`,
        interpreterId,
        interpreterName: 'Interpreter', // Assumes lookup in real implementation
        model: 'UPLOAD',
        status: InvoiceStatus.SUBMITTED,
        externalInvoiceReference: ref,
        totalAmount: amount,
        issueDate: new Date().toISOString(),
        items: [],
        currency: 'GBP',
        organizationId: 'SYSTEM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    timesheets.forEach(ts => {
        const mockTs = MOCK_TIMESHEETS.find(t => t.id === ts.id);
        if (mockTs) mockTs.interpreterInvoiceId = newInvoice.id;
    });

    MOCK_INTERPRETER_INVOICES.push(newInvoice);
    saveMockData();
    return newInvoice;
};
