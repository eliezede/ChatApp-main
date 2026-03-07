import { Job } from '../../jobs/types';
import { EmailService } from '../../../services/emailService';
import { JobStatus } from '../../jobs/status';

export const sendBookingConfirmationToClient = async (job: Job): Promise<boolean> => {
    try {
        // In the new architecture, we call the EmailService strictly for the recipient
        await EmailService.sendStatusEmail(job as any, JobStatus.BOOKED as any);
        return true;
    } catch (e) {
        console.error('Failed to send client confirmation', e);
        return false;
    }
};

export const sendBookingConfirmationToInterpreter = async (
    job: Job,
    interpreterDetails: { interpreterId: string, interpreterName: string, interpreterEmail: string }
): Promise<boolean> => {
    try {
        await EmailService.sendStatusEmail(job as any, JobStatus.BOOKED as any, interpreterDetails);
        return true;
    } catch (e) {
        console.error('Failed to send interpreter confirmation', e);
        return false;
    }
};
