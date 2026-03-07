import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { JobStatus } from '../status';
import { Job } from '../types';
import { NotificationService } from '../../../services/notificationService';
import { EmailService } from '../../../services/emailService';
import { MOCK_USERS, MOCK_BOOKINGS, saveMockData } from '../../../services/mockData';
import { NotificationType } from '../../../types';

export const createJob = async (jobData: Omit<Job, 'id' | 'status'>): Promise<Job> => {
    const newJob = {
        ...jobData,
        status: JobStatus.INCOMING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, 'bookings'), newJob);

        // Notify Admin
        const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
        admins.forEach(admin => {
            NotificationService.notify(
                admin.id,
                'New Job Request',
                `Client ${jobData.clientName} requested a ${jobData.languageTo} interpreter for ${jobData.date}.`,
                NotificationType.INFO,
                `/admin/bookings/${docRef.id}`
            );
        });

        // Email System
        await EmailService.sendStatusEmail({ ...newJob, id: docRef.id } as any, JobStatus.INCOMING as any);

        return { id: docRef.id, ...newJob } as unknown as Job;
    } catch (e) {
        const mockJob = { id: `b-${Date.now()}`, ...newJob, createdAt: new Date().toISOString() } as unknown as Job;
        MOCK_BOOKINGS.push(mockJob as any);
        saveMockData();
        return mockJob;
    }
};
