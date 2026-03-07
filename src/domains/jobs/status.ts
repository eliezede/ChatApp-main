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

export const isJobActive = (status: JobStatus): boolean => {
    return [
        'INCOMING',
        'PENDING_ASSIGNMENT',
        'QUOTE_PENDING',
        'BOOKED'
    ].includes(status);
};
