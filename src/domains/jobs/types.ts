import { JobStatus } from './status';
import { ServiceType, GuestContact, AssignmentStatus, Currency } from '../../shared/types/common';
import { TenantScopedEntity } from '../../shared/types/baseEntity';

export interface Job extends TenantScopedEntity {
    clientId: string;
    clientName: string;
    requestedByUserId: string;
    serviceType: ServiceType;
    languageFrom: string;
    languageTo: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    locationType: 'ONSITE' | 'ONLINE';
    location?: string;
    address?: string;
    postcode?: string;
    onlineLink?: string;
    status: JobStatus;
    costCode?: string;
    notes?: string;
    interpreterId?: string;
    interpreterName?: string;
    bookingRef?: string; // Eventually migrate to jobRef
    expectedEndTime?: string;
    caseType?: string;
    genderPreference?: 'Male' | 'Female' | 'None';
    guestContact?: GuestContact;
    currency?: Currency;
    priority?: 'High' | 'Normal' | 'Low';
    totalAmount?: number;
}

export interface JobAssignment {
    id: string;
    jobId: string;
    interpreterId: string;
    status: AssignmentStatus;
    offeredAt: string;
    respondedAt?: string;
    jobSnapshot?: Partial<Job>;
}
