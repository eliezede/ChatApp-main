import { JobStatus } from './status';

export const allowedTransitions: Record<JobStatus, JobStatus[]> = {
    INCOMING: ['PENDING_ASSIGNMENT', 'CANCELLED'],
    PENDING_ASSIGNMENT: ['QUOTE_PENDING', 'BOOKED', 'CANCELLED'],
    QUOTE_PENDING: ['BOOKED', 'CANCELLED'],
    BOOKED: ['SESSION_COMPLETED', 'CANCELLED'],
    SESSION_COMPLETED: ['TIMESHEET_SUBMITTED'],
    TIMESHEET_SUBMITTED: ['VERIFIED'],
    VERIFIED: ['INVOICING'],
    INVOICING: ['INVOICED'],
    INVOICED: ['PAID'],
    PAID: [],
    CANCELLED: [],
};

export const canTransition = (current: JobStatus, next: JobStatus): boolean => {
    return allowedTransitions[current]?.includes(next) ?? false;
};
