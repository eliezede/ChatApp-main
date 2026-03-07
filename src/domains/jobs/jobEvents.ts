export type JobEventType =
    | 'JOB_CREATED'
    | 'INTERPRETER_ASSIGNED'
    | 'ASSIGNMENT_ACCEPTED'
    | 'ASSIGNMENT_DECLINED'
    | 'BOOKING_CONFIRMED'
    | 'SESSION_COMPLETED'
    | 'TIMESHEET_SUBMITTED'
    | 'TIMESHEET_APPROVED'
    | 'JOB_VERIFIED'
    | 'CLIENT_INVOICE_GENERATED'
    | 'INTERPRETER_PAYMENT_GENERATED'
    | 'FEEDBACK_REQUESTED';

export interface JobEvent {
    id: string;
    jobId: string;
    organizationId: string;
    type: JobEventType;
    createdAt: string;
    actorUserId?: string;
    source?: 'system' | 'admin' | 'interpreter' | 'client';
    metadata?: Record<string, unknown>;
}

export const createJobEvent = (data: Omit<JobEvent, 'id' | 'createdAt'>): JobEvent => {
    return {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...data,
    };
};
