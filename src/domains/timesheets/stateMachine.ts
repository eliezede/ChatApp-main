import { TimesheetStatus } from './types';

export const allowedTimesheetTransitions: Record<TimesheetStatus, TimesheetStatus[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['APPROVED', 'DRAFT'], // Can revert to draft if rejected/needs revision
    APPROVED: ['INVOICED'],
    INVOICED: []
};

export const canTransitionTimesheet = (current: TimesheetStatus, next: TimesheetStatus): boolean => {
    return allowedTimesheetTransitions[current]?.includes(next) ?? false;
};

// Architecture Enforcement: Block invoicing without approval
export const isReadyForInvoicing = (status: TimesheetStatus): boolean => {
    return status === 'APPROVED';
};
