import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { JobStatus } from '../status';
import { Job } from '../types';
import { AssignmentStatus } from '../../../shared/types/common';
import { NotificationService } from '../../../services/notificationService';
import { EmailService } from '../../../services/emailService';
import { MOCK_USERS, MOCK_BOOKINGS, MOCK_ASSIGNMENTS, saveMockData } from '../../../services/mockData';
import { NotificationType } from '../../../types';

const getInterpreterUser = async (interpreterId: string): Promise<{ id: string; email?: string; displayName?: string } | undefined> => {
    try {
        const q = query(collection(db, 'users'), where('profileId', '==', interpreterId));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const d = snap.docs[0];
            return { id: d.id, ...(d.data() as any) };
        }
    } catch (_) { /* fall through to mock */ }
    return MOCK_USERS.find(u => u.profileId === interpreterId) as any;
};

export const unassignInterpreter = async (jobId: string): Promise<void> => {
    try {
        const jobRef = doc(db, 'bookings', jobId);
        const jobSnap = await getDoc(jobRef);
        if (!jobSnap.exists()) throw new Error('Job not found');

        const jobData = { id: jobId, ...jobSnap.data() } as Job;
        const interpreterId = jobData.interpreterId;

        // Reset status to INCOMING so it can be reassigned
        await updateDoc(jobRef, {
            status: JobStatus.INCOMING,
            interpreterId: null,
            interpreterName: null,
            updatedAt: serverTimestamp()
        });

        // Update assignment: mark as DECLINED
        if (interpreterId) {
            const assignmentsQuery = query(collection(db, 'assignments'),
                where('bookingId', '==', jobId),
                where('interpreterId', '==', interpreterId)
            );
            const assignmentsSnap = await getDocs(assignmentsQuery);
            const batch = writeBatch(db);
            assignmentsSnap.docs.forEach(d => {
                batch.update(d.ref, { status: AssignmentStatus.DECLINED, respondedAt: new Date().toISOString() });
            });
            await batch.commit();

            // Notify Interpreter
            const interpreterUser = await getInterpreterUser(interpreterId);
            if (interpreterUser) {
                NotificationService.notify(
                    interpreterUser.id,
                    'Assignment Removed',
                    `You have been unassigned from the job on ${jobData.date}. Please check your portal for updates.`,
                    NotificationType.URGENT,
                    '/interpreter/dashboard'
                );

                // Send Email
                await EmailService.sendStatusEmail({ ...jobData, status: JobStatus.CANCELLED as any } as any, JobStatus.CANCELLED as any, {
                    interpreterId: interpreterId,
                    interpreterName: jobData.interpreterName || 'Interpreter',
                    interpreterEmail: interpreterUser.email
                });
            }
        }
    } catch (e) {
        const b = MOCK_BOOKINGS.find(book => book.id === jobId);
        if (b) {
            const oldId = b.interpreterId;
            const oldName = b.interpreterName;
            const oldDate = b.date;

            b.status = JobStatus.INCOMING as any;
            b.interpreterId = undefined;
            b.interpreterName = undefined;

            if (oldId) {
                MOCK_ASSIGNMENTS.forEach(a => {
                    if (a.bookingId === jobId && a.interpreterId === oldId) {
                        a.status = AssignmentStatus.DECLINED;
                    }
                });

                const interpreterUser = MOCK_USERS.find(u => u.profileId === oldId);
                if (interpreterUser) {
                    NotificationService.notify(
                        interpreterUser.id,
                        'Assignment Removed',
                        `You have been unassigned from the job on ${oldDate}. Please check your portal for updates.`,
                        NotificationType.URGENT,
                        '/interpreter/dashboard'
                    );
                }
            }
            saveMockData();
        }
    }
};
