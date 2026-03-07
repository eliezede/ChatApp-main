import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { JobStatus } from '../status';
import { Job } from '../types';
import { ClientService } from '../../../services/clientService';
import { NotificationService } from '../../../services/notificationService';
import { EmailService } from '../../../services/emailService';
import { MOCK_USERS, MOCK_BOOKINGS, saveMockData } from '../../../services/mockData';
import { NotificationType } from '../../../types';

export const createGuestJob = async (input: any): Promise<Job> => {
    const bookingRef = `LL-${Math.floor(1000 + Math.random() * 9000)}`;
    const start = new Date(`2000-01-01T${input.startTime}`);
    const end = new Date(start.getTime() + input.durationMinutes * 60000);
    const expectedEndTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // 1. Handle Client Association
    let clientId = '';
    const email = input.guestContact?.email;
    if (email) {
        const existingClient = await ClientService.getByEmail(email);
        if (existingClient) {
            clientId = existingClient.id;
        } else {
            const newGuestClient = await ClientService.createClientFromGuest(input.guestContact);
            clientId = newGuestClient.id;
        }
    }

    const newJob = {
        ...input,
        clientId,
        bookingRef,
        status: JobStatus.INCOMING,
        expectedEndTime,
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
                'New Guest Job',
                `Reference ${bookingRef}: New request for ${input.languageTo}.`,
                NotificationType.URGENT,
                `/admin/bookings/${docRef.id}`
            );
        });

        // Email System
        await EmailService.sendStatusEmail({ ...newJob, id: docRef.id } as any, JobStatus.INCOMING as any);

        return { id: docRef.id, ...newJob } as unknown as Job;
    } catch (e) {
        const mockBooking = { id: `b-g-${Date.now()}`, ...newJob, createdAt: new Date().toISOString() } as unknown as Job;
        MOCK_BOOKINGS.push(mockBooking as any);
        saveMockData();
        return mockBooking;
    }
};
