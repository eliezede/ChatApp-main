import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { JobStatus } from '../status';
import { Job } from '../types';
import { AssignmentStatus } from '../../../shared/types/common';
import { NotificationService } from '../../../services/notificationService';
import { EmailService } from '../../../services/emailService';
import { MOCK_USERS, MOCK_BOOKINGS, MOCK_INTERPRETERS, MOCK_ASSIGNMENTS, saveMockData } from '../../../services/mockData';
import { NotificationType, Interpreter } from '../../../types';

export const declineAssignment = async (assignmentId: string): Promise<void> => {
    try {
        await updateDoc(doc(db, 'assignments', assignmentId), {
            status: AssignmentStatus.DECLINED,
            respondedAt: new Date().toISOString()
        });
    } catch (e) {
        const a = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
        if (a) {
            a.status = AssignmentStatus.DECLINED;
            saveMockData();
        }
    }
};
