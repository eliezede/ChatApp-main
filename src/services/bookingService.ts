
import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, writeBatch, limit
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Booking, BookingStatus, BookingAssignment, AssignmentStatus, Interpreter, NotificationType } from '../types';
import { MOCK_INTERPRETERS, MOCK_ASSIGNMENTS, saveMockData, MOCK_BOOKINGS, MOCK_USERS } from './mockData';
import { NotificationService } from './notificationService';

const COLLECTION_NAME = 'bookings';
const ASSIGNMENTS_COLLECTION = 'assignments';

export const BookingService = {
  getAll: async (): Promise<Booking[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      return results.length > 0 ? results : MOCK_BOOKINGS;
    } catch (error) {
      return MOCK_BOOKINGS;
    }
  },

  getById: async (id: string): Promise<Booking | undefined> => {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as Booking;
      return MOCK_BOOKINGS.find(b => b.id === id);
    } catch (error) {
      return MOCK_BOOKINGS.find(b => b.id === id);
    }
  },

  create: async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
    const newBooking = { ...bookingData, status: BookingStatus.REQUESTED, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newBooking);

      // Notify Admin
      const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
      admins.forEach(admin => {
        NotificationService.notify(admin.id, 'New Booking Request', `Client ${bookingData.clientName} requested a ${bookingData.languageTo} interpreter for ${bookingData.date}.`, NotificationType.INFO, `/admin/bookings/${docRef.id}`);
      });

      return { id: docRef.id, ...newBooking } as unknown as Booking;
    } catch (e) {
      const mockBooking = { id: `b-${Date.now()}`, ...newBooking, createdAt: new Date().toISOString() } as unknown as Booking;
      MOCK_BOOKINGS.push(mockBooking);
      saveMockData();
      return mockBooking;
    }
  },

  createGuestBooking: async (input: any): Promise<Booking> => {
    const bookingRef = `LL-${Math.floor(1000 + Math.random() * 9000)}`;
    const start = new Date(`2000-01-01T${input.startTime}`);
    const end = new Date(start.getTime() + input.durationMinutes * 60000);
    const expectedEndTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newBooking = { ...input, bookingRef, status: BookingStatus.REQUESTED, expectedEndTime, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newBooking);

      // Notify Admin
      const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
      admins.forEach(admin => {
        NotificationService.notify(admin.id, 'New Guest Booking', `Reference ${bookingRef}: New request for ${input.languageTo}.`, NotificationType.URGENT, `/admin/bookings/${docRef.id}`);
      });

      return { id: docRef.id, ...newBooking } as unknown as Booking;
    } catch (e) {
      const mockBooking = { id: `b-g-${Date.now()}`, ...newBooking, createdAt: new Date().toISOString() } as unknown as Booking;
      MOCK_BOOKINGS.push(mockBooking);
      saveMockData();
      return mockBooking;
    }
  },

  updateStatus: async (id: string, status: BookingStatus): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), { status, updatedAt: serverTimestamp() });
    } catch (e) {
      const b = MOCK_BOOKINGS.find(book => book.id === id);
      if (b) { b.status = status; saveMockData(); }
    }
  },

  update: async (id: string, data: Partial<Booking>): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
      const b = MOCK_BOOKINGS.find(book => book.id === id);
      if (b) { Object.assign(b, data); saveMockData(); }
    }
  },

  assignInterpreterToBooking: async (bookingId: string, interpreterId: string): Promise<void> => {
    try {
      const bookingRef = doc(db, COLLECTION_NAME, bookingId);
      const bookingSnap = await getDoc(bookingRef);
      const bookingData = bookingSnap.data() as Booking;

      // Fetch interpreter name for denormalization
      const intSnap = await getDoc(doc(db, 'interpreters', interpreterId));
      const intName = intSnap.exists() ? (intSnap.data() as Interpreter).name : 'Unknown';

      // Update booking to CONFIRMED
      await updateDoc(bookingRef, {
        status: BookingStatus.CONFIRMED,
        interpreterId: interpreterId,
        interpreterName: intName,
        updatedAt: serverTimestamp()
      });

      // Cancel/Decline other pending offers for this booking
      const assignmentsQuery = query(collection(db, ASSIGNMENTS_COLLECTION),
        where('bookingId', '==', bookingId),
        where('status', '==', AssignmentStatus.OFFERED)
      );
      const assignmentsSnap = await getDocs(assignmentsQuery);
      const batch = writeBatch(db);
      assignmentsSnap.docs.forEach(d => {
        if (d.data().interpreterId !== interpreterId) {
          batch.update(d.ref, { status: AssignmentStatus.DECLINED, respondedAt: new Date().toISOString() });
        } else {
          batch.update(d.ref, { status: AssignmentStatus.ACCEPTED, respondedAt: new Date().toISOString() });
        }
      });
      await batch.commit();

      // Notify Interpreter
      const interpreterUser = MOCK_USERS.find(u => u.profileId === interpreterId);
      if (interpreterUser) {
        NotificationService.notify(interpreterUser.id, 'Job Confirmed', `Your assignment for ${bookingData?.languageTo || 'Job'} on ${bookingData?.date} is officially confirmed.`, NotificationType.SUCCESS, `/interpreter/jobs/${bookingId}`);
      }

    } catch (e) {
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      const i = MOCK_INTERPRETERS.find(inter => inter.id === interpreterId);
      if (b && i) {
        b.status = BookingStatus.CONFIRMED;
        b.interpreterId = interpreterId;
        b.interpreterName = i.name;

        // Mock multi-offer decline
        MOCK_ASSIGNMENTS.forEach(a => {
          if (a.bookingId === bookingId && a.interpreterId !== interpreterId && a.status === AssignmentStatus.OFFERED) {
            a.status = AssignmentStatus.DECLINED;
          } else if (a.bookingId === bookingId && a.interpreterId === interpreterId) {
            a.status = AssignmentStatus.ACCEPTED;
          }
        });
        saveMockData();
      }
    }
  },

  unassignInterpreterFromBooking: async (bookingId: string): Promise<void> => {
    try {
      const bookingRef = doc(db, COLLECTION_NAME, bookingId);
      const bookingSnap = await getDoc(bookingRef);
      const bookingData = bookingSnap.data() as Booking;
      const interpreterId = bookingData.interpreterId;

      // Update booking: reset status and clear interpreter
      await updateDoc(bookingRef, {
        status: BookingStatus.REQUESTED,
        interpreterId: null,
        interpreterName: null,
        updatedAt: serverTimestamp()
      });

      // Update assignment: mark as DECLINED or CANCELLED if exists
      if (interpreterId) {
        const assignmentsQuery = query(collection(db, ASSIGNMENTS_COLLECTION),
          where('bookingId', '==', bookingId),
          where('interpreterId', '==', interpreterId),
          where('status', '==', AssignmentStatus.ACCEPTED)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        const batch = writeBatch(db);
        assignmentsSnap.docs.forEach(d => {
          batch.update(d.ref, { status: AssignmentStatus.DECLINED, respondedAt: new Date().toISOString() });
        });
        await batch.commit();

        // Notify Interpreter
        const interpreterUser = MOCK_USERS.find(u => u.profileId === interpreterId);
        if (interpreterUser) {
          NotificationService.notify(
            interpreterUser.id,
            'Assignment Removed',
            `You have been unassigned from the job on ${bookingData.date}. Please check your portal for updates.`,
            NotificationType.URGENT,
            '/interpreter/offers'
          );
        }
      }
    } catch (e) {
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      if (b) {
        const oldId = b.interpreterId;
        b.status = BookingStatus.REQUESTED;
        b.interpreterId = undefined;
        b.interpreterName = undefined;

        if (oldId) {
          MOCK_ASSIGNMENTS.forEach(a => {
            if (a.bookingId === bookingId && a.interpreterId === oldId) {
              a.status = AssignmentStatus.DECLINED;
            }
          });
        }
        saveMockData();
      }
    }
  },

  findInterpretersByLanguage: async (language: string): Promise<Interpreter[]> => {
    try {
      const snap = await getDocs(query(collection(db, 'interpreters'), where('status', '==', 'ACTIVE')));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Interpreter));
      return all.filter(i => i.languages.some(l => l.toLowerCase().includes(language.toLowerCase())));
    } catch (error) {
      return MOCK_INTERPRETERS.filter(i => i.languages.some(l => l.toLowerCase().includes(language.toLowerCase())));
    }
  },

  getAssignmentsByBookingId: async (bookingId: string): Promise<BookingAssignment[]> => {
    try {
      const q = query(collection(db, ASSIGNMENTS_COLLECTION), where('bookingId', '==', bookingId));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingAssignment));
      return results.length > 0 ? results : MOCK_ASSIGNMENTS.filter(a => a.bookingId === bookingId);
    } catch (error) {
      return MOCK_ASSIGNMENTS.filter(a => a.bookingId === bookingId);
    }
  },

  createAssignment: async (bookingId: string, interpreterId: string): Promise<BookingAssignment> => {
    const newAssignment = { bookingId, interpreterId, status: AssignmentStatus.OFFERED, offeredAt: new Date().toISOString() };
    try {
      const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), newAssignment);
      await updateDoc(doc(db, COLLECTION_NAME, bookingId), { status: BookingStatus.OFFERED });

      // Notify Interpreter
      const interpreterUser = MOCK_USERS.find(u => u.profileId === interpreterId);
      if (interpreterUser) {
        NotificationService.notify(interpreterUser.id, 'New Job Offer', 'You have a new interpreting request matching your profile.', NotificationType.INFO, '/interpreter/offers');
      }

      return { id: docRef.id, ...newAssignment } as BookingAssignment;
    } catch (e) {
      const mockAssignment = { id: `a-${Date.now()}`, ...newAssignment } as BookingAssignment;
      MOCK_ASSIGNMENTS.push(mockAssignment);
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      if (b && (b.status === BookingStatus.REQUESTED || b.status === BookingStatus.OFFERED)) b.status = BookingStatus.OFFERED;
      saveMockData();
      return mockAssignment;
    }
  },

  getRecentBookings: async (limitCount: number = 5): Promise<Booking[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    } catch (error) {
      return MOCK_BOOKINGS.slice(0, limitCount);
    }
  },

  checkScheduleConflict: async (interpreterId: string, date: string, startTime: string, durationMinutes: number, excludeBookingId?: string): Promise<Booking | null> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('interpreterId', '==', interpreterId),
        where('date', '==', date),
        where('status', '==', BookingStatus.CONFIRMED)
      );
      const snap = await getDocs(q);
      const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));

      const targetStart = new Date(`${date}T${startTime}`);
      const targetEnd = new Date(targetStart.getTime() + durationMinutes * 60000);

      for (const existing of bookings) {
        if (existing.id === excludeBookingId) continue;
        const existingStart = new Date(`${existing.date}T${existing.startTime}`);
        const existingEnd = new Date(existingStart.getTime() + existing.durationMinutes * 60000);
        if (targetStart < existingEnd && targetEnd > existingStart) return existing;
      }
      return null;
    } catch (e) {
      // Minimal fallback to mock
      return null;
    }
  },

  getInterpreterOffers: async (interpreterId: string): Promise<BookingAssignment[]> => {
    try {
      const q = query(collection(db, ASSIGNMENTS_COLLECTION), where('interpreterId', '==', interpreterId), where('status', '==', AssignmentStatus.OFFERED));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingAssignment));
    } catch (error) {
      return MOCK_ASSIGNMENTS.filter(a => a.interpreterId === interpreterId && a.status === AssignmentStatus.OFFERED);
    }
  },

  getInterpreterSchedule: async (interpreterId: string): Promise<Booking[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('interpreterId', '==', interpreterId));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      return all.filter(b => [BookingStatus.CONFIRMED, BookingStatus.COMPLETED].includes(b.status)).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      return MOCK_BOOKINGS.filter(b => b.interpreterId === interpreterId && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED));
    }
  },

  acceptOffer: async (assignmentId: string): Promise<void> => {
    try {
      const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
      const snap = await getDoc(assignmentRef);
      if (snap.exists()) {
        const data = snap.data() as BookingAssignment;

        // Check if booking is already accepted or confirmed
        const bookingRef = doc(db, COLLECTION_NAME, data.bookingId);
        const bookingSnap = await getDoc(bookingRef);
        const bookingData = bookingSnap.data() as Booking;

        if (bookingData.status !== BookingStatus.OFFERED) {
          throw new Error('This job is no longer available.');
        }

        // Fetch interpreter name
        const intSnap = await getDoc(doc(db, 'interpreters', data.interpreterId));
        const intName = intSnap.exists() ? (intSnap.data() as Interpreter).name : 'Unknown';

        await updateDoc(assignmentRef, { status: AssignmentStatus.ACCEPTED, respondedAt: new Date().toISOString() });

        // Premium Workflow: Instead of CONFIRMED, we go to ACCEPTED status (pending Admin confirmation)
        await updateDoc(bookingRef, {
          status: BookingStatus.ACCEPTED,
          interpreterId: data.interpreterId,
          interpreterName: intName
        });

        // Notify Admins
        const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
        admins.forEach(admin => {
          NotificationService.notify(admin.id, 'Interpreter Accepted Offer', `Job #${data.bookingId} has been accepted and is waiting for your final confirmation.`, NotificationType.URGENT, `/admin/bookings/${data.bookingId}`);
        });

      }
    } catch (e) {
      const a = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
      if (a) {
        a.status = AssignmentStatus.ACCEPTED;
        const b = MOCK_BOOKINGS.find(book => book.id === a.bookingId);
        const i = MOCK_INTERPRETERS.find(inter => inter.id === a.interpreterId);
        if (b) {
          b.status = BookingStatus.ACCEPTED;
          b.interpreterId = a.interpreterId;
          if (i) b.interpreterName = i.name;
        }
        saveMockData();
      }
    }
  },

  declineOffer: async (assignmentId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, ASSIGNMENTS_COLLECTION, assignmentId), { status: AssignmentStatus.DECLINED, respondedAt: new Date().toISOString() });
    } catch (e) {
      const a = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
      if (a) { a.status = AssignmentStatus.DECLINED; saveMockData(); }
    }
  },

  linkClientToBooking: async (bookingId: string, clientId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, bookingId), { clientId, updatedAt: serverTimestamp() });
    } catch (e) {
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      if (b) { b.clientId = clientId; saveMockData(); }
    }
  }
};
