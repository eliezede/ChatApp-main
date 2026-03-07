export type JobStatus =
    | 'INCOMING'
    | 'PENDING_ASSIGNMENT'
    | 'QUOTE_PENDING'
    | 'BOOKED'
    | 'SESSION_COMPLETED'
    | 'TIMESHEET_SUBMITTED'
    | 'VERIFIED'
    | 'INVOICING'
    | 'INVOICED'
    | 'PAID'
    | 'CANCELLED';

export const JobStatus = {
    INCOMING: 'INCOMING' as const,
    PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT' as const,
    QUOTE_PENDING: 'QUOTE_PENDING' as const,
    BOOKED: 'BOOKED' as const,
    SESSION_COMPLETED: 'SESSION_COMPLETED' as const,
    TIMESHEET_SUBMITTED: 'TIMESHEET_SUBMITTED' as const,
    VERIFIED: 'VERIFIED' as const,
    INVOICING: 'INVOICING' as const,
    INVOICED: 'INVOICED' as const,
    PAID: 'PAID' as const,
    CANCELLED: 'CANCELLED' as const,
};

export const isJobActive = (status: JobStatus): boolean => {
    return [
        'INCOMING',
        'PENDING_ASSIGNMENT',
        'QUOTE_PENDING',
        'BOOKED'
    ].includes(status);
};
