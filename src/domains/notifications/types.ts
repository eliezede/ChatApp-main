import { JobStatus, Job } from '../../jobs/types';

export type NotificationRecipientType = 'CLIENT' | 'INTERPRETER' | 'ADMIN';

export interface EmailTemplate {
    id: string;
    organizationId?: string;
    triggerStatus: JobStatus;
    recipientType: NotificationRecipientType;
    name: string;
    subject: string;
    body: string;
    allowedVariables: string[];
    isActive: boolean;
    updatedAt?: string;
}

export const EMAIL_VARIABLES = {
    CLIENT: ['{{clientName}}', '{{jobRef}}', '{{date}}', '{{time}}', '{{location}}', '{{languageFrom}}', '{{languageTo}}', '{{serviceType}}', '{{durationMinutes}}', '{{totalAmount}}'],
    INTERPRETER: ['{{interpreterName}}', '{{jobRef}}', '{{date}}', '{{time}}', '{{location}}', '{{languageFrom}}', '{{languageTo}}', '{{serviceType}}', '{{durationMinutes}}'],
    ADMIN: ['{{clientName}}', '{{interpreterName}}', '{{jobRef}}', '{{status}}']
};
