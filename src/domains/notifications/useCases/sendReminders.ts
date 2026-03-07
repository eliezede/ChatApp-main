import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { JobStatus } from '../../jobs/status';
import { Job } from '../../jobs/types';
import { EmailService } from '../../../services/emailService';

export const sendReminder4h = async (): Promise<number> => {
    // Logic to find jobs starting in ~4 hours and trigger reminders
    // This would ideally be called by a cron job (Firebase Scheduled Function)
    let count = 0;
    try {
        const now = new Date();
        const future = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const dateStr = future.toISOString().split('T')[0];

        const q = query(
            collection(db, 'bookings'),
            where('status', '==', JobStatus.BOOKED),
            where('date', '==', dateStr)
        );

        // Simplification for the architecture proof:
        const snap = await getDocs(q);
        snap.docs.forEach(doc => {
            // Check exact time and send reminder
            count++;
            // EmailService.sendCustomEmail(...)
        });

    } catch (e) {
        console.warn('Reminder 4h check failed', e);
    }
    return count;
};

export const sendTimesheetReminder = async (): Promise<number> => {
    // Finds SESSION_COMPLETED or BOOKED jobs in the past without a timesheet
    let count = 0;
    return count;
};
