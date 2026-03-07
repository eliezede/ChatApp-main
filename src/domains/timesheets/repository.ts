import { Timesheet } from './types';
import { TimesheetStatus } from './types';

export interface TimesheetRepository {
    getById(id: string): Promise<Timesheet | null>;
    create(data: Omit<Timesheet, 'id'>): Promise<Timesheet>;
    update(id: string, data: Partial<Timesheet>): Promise<void>;
    updateStatus(id: string, newStatus: TimesheetStatus): Promise<void>;
    findByInterpreter(interpreterId: string): Promise<Timesheet[]>;
    findPendingApproval(): Promise<Timesheet[]>;
}
