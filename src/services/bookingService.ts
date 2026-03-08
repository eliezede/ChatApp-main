
import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, writeBatch, limit
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Booking, BookingStatus, BookingAssignment, AssignmentStatus, Interpreter, NotificationType, Client } from '../types';
import { ClientService } from './clientService';
import { MOCK_INTERPRETERS, MOCK_ASSIGNMENTS, saveMockData, MOCK_BOOKINGS, MOCK_USERS } from './mockData';
import { NotificationService } from './notificationService';
import { EmailService } from './emailService';

const COLLECTION_NAME = 'bookings';
const ASSIGNMENTS_COLLECTION = 'assignments';

// Helper: find the Firebase Auth user document for an interpreter by their profile ID.
// Falls back to MOCK_USERS for local dev.
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

  getByInterpreterId: async (interpreterId: string): Promise<Booking[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('interpreterId', '==', interpreterId));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      return results.length > 0 ? results : MOCK_BOOKINGS.filter(b => b.interpreterId === interpreterId);
    } catch {
      return MOCK_BOOKINGS.filter(b => b.interpreterId === interpreterId);
    }
  },

  getJobEvents: async (jobId: string): Promise<any[]> => {
    try {
      const q = query(collection(db, 'jobEvents'), where('jobId', '==', jobId), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    } catch {
      return [];
    }
  },

  getByClientId: async (clientId: string): Promise<Booking[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      return results.length > 0 ? results : MOCK_BOOKINGS.filter(b => b.clientId === clientId);
    } catch {
      return MOCK_BOOKINGS.filter(b => b.clientId === clientId);
    }
  },

  create: async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
    const newBooking = { ...bookingData, status: BookingStatus.INCOMING, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newBooking);

      // Notify Admin
      const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
      admins.forEach(admin => {
        NotificationService.notify(admin.id, 'New Booking Request', `Client ${bookingData.clientName} requested a ${bookingData.languageTo} interpreter for ${bookingData.date}.`, NotificationType.INFO, `/admin/bookings/${docRef.id}`);
      });

      // Email System
      await EmailService.sendStatusEmail({ ...newBooking, id: docRef.id } as Booking, BookingStatus.INCOMING);

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

    const newBooking = {
      ...input,
      clientId, // Linked to the new or existing GUEST client
      bookingRef,
      status: BookingStatus.INCOMING,
      expectedEndTime,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newBooking);

      // Notify Admin
      const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
      admins.forEach(admin => {
        NotificationService.notify(admin.id, 'New Guest Booking', `Reference ${bookingRef}: New request for ${input.languageTo}.`, NotificationType.URGENT, `/admin/bookings/${docRef.id}`);
      });

      // Email System
      await EmailService.sendStatusEmail({ ...newBooking, id: docRef.id } as Booking, BookingStatus.INCOMING);

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

      const booking = await BookingService.getById(id);
      if (booking) {
        let intEmail = '';
        if (booking.interpreterId) {
          const intUser = await getInterpreterUser(booking.interpreterId);
          const intSnap = await getDoc(doc(db, 'interpreters', booking.interpreterId));
          const intDirectEmail = intSnap.exists() ? (intSnap.data() as any).email : '';
          intEmail = intDirectEmail || intUser?.email || '';
        }
        await EmailService.sendStatusEmail(booking, status, {
          interpreterId: booking.interpreterId,
          interpreterName: booking.interpreterName,
          interpreterEmail: intEmail
        });
      }
    } catch (e) {
      console.warn('Firebase updateStatus failed', e);
    }

    // Always update Mock for consistency
    const b = MOCK_BOOKINGS.find(book => book.id === id);
    if (b) {
      b.status = status;
      saveMockData();
    }
  },

  update: async (id: string, data: Partial<Booking>): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
      console.warn('Firebase update failed', error);
    }

    // Always update Mock for consistency
    const b = MOCK_BOOKINGS.find(book => book.id === id);
    if (b) {
      Object.assign(b, data);
      saveMockData();
    }
  },

  assignInterpreterToBooking: async (bookingId: string, interpreterId: string): Promise<void> => {
    try {
      const bookingRef = doc(db, COLLECTION_NAME, bookingId);
      const bookingSnap = await getDoc(bookingRef);
      const bookingData = { ...bookingSnap.data(), id: bookingId } as Booking;

      // Fetch interpreter name AND email from Firestore interpreters collection
      const intSnap = await getDoc(doc(db, 'interpreters', interpreterId));
      const intData = intSnap.exists() ? (intSnap.data() as Interpreter) : undefined;
      const intName = intData?.name || 'Unknown';
      const intEmail = intData?.email || '';

      // Update booking to OPENED (Pending Interpreter Verification/Acceptance)
      await updateDoc(bookingRef, {
        status: BookingStatus.OPENED,
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

      // Notify Interpreter (real Firestore user lookup)
      const interpreterUser = await getInterpreterUser(interpreterId);
      if (interpreterUser) {
        NotificationService.notify(interpreterUser.id, 'Job Confirmed', `Your assignment for ${bookingData?.languageTo || 'Job'} on ${bookingData?.date} is officially confirmed.`, NotificationType.SUCCESS, `/interpreter/jobs/${bookingId}`);
      }

      // Email to Interpreter
      await EmailService.sendStatusEmail(bookingData, BookingStatus.OPENED, {
        interpreterId: interpreterId,
        interpreterName: intName,
        interpreterEmail: intEmail || interpreterUser?.email
      });

    } catch (e) {
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      const i = MOCK_INTERPRETERS.find(inter => inter.id === interpreterId);
      if (b && i) {
        b.status = BookingStatus.OPENED;
        b.interpreterId = interpreterId;
        b.interpreterName = i.name;
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
      if (!bookingSnap.exists()) throw new Error('Booking not found');

      const bookingData = { id: bookingId, ...bookingSnap.data() } as Booking;
      const interpreterId = bookingData.interpreterId;

      // Update booking: reset status to OPENED (if it was BOOKED) or INCOMING
      // The user requested it to stay as "opened" but usually unassigning means making it available again.
      // If it goes to OPENED without an interpreter, it's inconsistent. 
      // Reverting to INCOMING makes it available for new offers.
      await updateDoc(bookingRef, {
        status: BookingStatus.INCOMING,
        interpreterId: null,
        interpreterName: null,
        updatedAt: serverTimestamp()
      });

      // Update assignment: mark as DECLINED or CANCELLED if exists
      if (interpreterId) {
        const assignmentsQuery = query(collection(db, ASSIGNMENTS_COLLECTION),
          where('bookingId', '==', bookingId),
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
            `You have been unassigned from the job on ${bookingData.date}. Please check your portal for updates.`,
            NotificationType.URGENT,
            '/interpreter/jobs'
          );

          // Send Email
          await EmailService.sendStatusEmail({ ...bookingData, status: BookingStatus.CANCELLED }, BookingStatus.CANCELLED, {
            interpreterId: interpreterId,
            interpreterName: bookingData.interpreterName || 'Interpreter',
            interpreterEmail: interpreterUser.email
          });
        }
      }
    } catch (e) {
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      if (b) {
        const oldId = b.interpreterId;
        const oldName = b.interpreterName;
        const oldDate = b.date;

        b.status = BookingStatus.INCOMING;
        b.interpreterId = undefined;
        b.interpreterName = undefined;

        if (oldId) {
          MOCK_ASSIGNMENTS.forEach(a => {
            if (a.bookingId === bookingId && a.interpreterId === oldId) {
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
              '/interpreter/jobs'
            );

            // Mock Email
            console.log(`[MOCK EMAIL] To: ${interpreterUser.email} - Subject: Assignment Removed for job on ${oldDate}`);
          }
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
      await updateDoc(doc(db, COLLECTION_NAME, bookingId), { status: BookingStatus.OPENED });

      // Fetch interpreter info from Firestore
      const intSnap = await getDoc(doc(db, 'interpreters', interpreterId));
      const intData = intSnap.exists() ? (intSnap.data() as Interpreter) : undefined;
      const intName = intData?.name || '';
      const intEmail = intData?.email || '';

      // Fetch booking data for email template
      const bookingSnap = await getDoc(doc(db, COLLECTION_NAME, bookingId));
      const bookingData = { ...bookingSnap.data(), id: bookingId } as Booking;

      // Notify Interpreter via real Firestore user lookup
      const interpreterUser = await getInterpreterUser(interpreterId);
      if (interpreterUser) {
        NotificationService.notify(interpreterUser.id, 'New Job Offer', 'You have a new interpreting request matching your profile.', NotificationType.INFO, '/interpreter/jobs');
      }

      await EmailService.sendStatusEmail(bookingData, BookingStatus.OPENED, {
        interpreterId,
        interpreterName: intName,
        interpreterEmail: intEmail || interpreterUser?.email
      });

      return { id: docRef.id, ...newAssignment } as BookingAssignment;
    } catch (e) {
      const mockAssignment = { id: `a-${Date.now()}`, ...newAssignment } as BookingAssignment;
      MOCK_ASSIGNMENTS.push(mockAssignment);
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      if (b && (b.status === BookingStatus.INCOMING || b.status === BookingStatus.OPENED)) b.status = BookingStatus.OPENED;
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
        where('status', '==', BookingStatus.BOOKED)
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
      return all.filter(b => [BookingStatus.OPENED, 'PENDING_ASSIGNMENT' as any, BookingStatus.BOOKED, BookingStatus.INVOICING, BookingStatus.INVOICED, BookingStatus.PAID].includes(b.status)).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      return MOCK_BOOKINGS.filter(b => b.interpreterId === interpreterId && (b.status === BookingStatus.OPENED || (b.status as any) === 'PENDING_ASSIGNMENT' || b.status === BookingStatus.BOOKED || b.status === BookingStatus.INVOICING || b.status === BookingStatus.INVOICED || b.status === BookingStatus.PAID));
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

        if (bookingData.status !== BookingStatus.OPENED) {
          throw new Error('This job is no longer available.');
        }

        // Fetch interpreter name
        const intSnap = await getDoc(doc(db, 'interpreters', data.interpreterId));
        const intName = intSnap.exists() ? (intSnap.data() as Interpreter).name : 'Unknown';

        await updateDoc(assignmentRef, { status: AssignmentStatus.ACCEPTED, respondedAt: new Date().toISOString() });

        // Premium Workflow: Go to BOOKED status
        await updateDoc(bookingRef, {
          status: BookingStatus.BOOKED,
          interpreterId: data.interpreterId,
          interpreterName: intName
        });

        // Notify Admins
        const admins = MOCK_USERS.filter(u => u.role === 'ADMIN');
        admins.forEach(admin => {
          NotificationService.notify(admin.id, 'Interpreter Accepted Offer', `Job #${data.bookingId} has been accepted and is waiting for your final confirmation.`, NotificationType.URGENT, `/admin/bookings/${data.bookingId}`);
        });

        // Email System - send BOOKED email to both client and interpreter
        const intUserForEmail = await getInterpreterUser(data.interpreterId);
        const intSnapForEmail = await getDoc(doc(db, 'interpreters', data.interpreterId));
        const intEmailDirect = intSnapForEmail.exists() ? (intSnapForEmail.data() as Interpreter).email : '';
        await EmailService.sendStatusEmail({ ...bookingData, id: data.bookingId }, BookingStatus.BOOKED, {
          interpreterId: data.interpreterId,
          interpreterName: intName,
          interpreterEmail: intEmailDirect || intUserForEmail?.email
        });

      }
    } catch (e) {
      const a = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
      if (a) {
        a.status = AssignmentStatus.ACCEPTED;
        const b = MOCK_BOOKINGS.find(book => book.id === a.bookingId);
        const i = MOCK_INTERPRETERS.find(inter => inter.id === a.interpreterId);
        if (b) {
          b.status = BookingStatus.BOOKED;
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
  },

  linkOrphanedBookings: async (email: string, clientId: string): Promise<number> => {
    let count = 0;
    try {
      // Find all bookings where guestContact.email matches and clientId is missing
      const q = query(
        collection(db, COLLECTION_NAME),
        where('guestContact.email', '==', email)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);

      snap.docs.forEach(d => {
        const data = d.data();
        if (!data.clientId) {
          batch.update(d.ref, { clientId, updatedAt: serverTimestamp() });
          count++;
        }
      });

      if (count > 0) await batch.commit();
      return count;
    } catch (e) {
      // Mock Fallback
      MOCK_BOOKINGS.forEach(b => {
        if (b.guestContact?.email === email && !b.clientId) {
          b.clientId = clientId;
          count++;
        }
      });
      if (count > 0) saveMockData();
      return count;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      // 1. Delete associated assignments first in Firebase
      const assignmentsQuery = query(collection(db, ASSIGNMENTS_COLLECTION), where('bookingId', '==', id));
      const assignmentsSnap = await getDocs(assignmentsQuery);
      const batch = writeBatch(db);
      assignmentsSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // 2. Delete the booking from Firebase
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
      console.warn('Firebase deletion failed or not configured, relying on mock cleanup.', e);
    }

    // 3. Always check and remove from Mock data to avoid "stuck" example jobs
    const index = MOCK_BOOKINGS.findIndex(b => b.id === id);
    if (index > -1) {
      MOCK_BOOKINGS.splice(index, 1);
      // Also remove mock assignments
      for (let i = MOCK_ASSIGNMENTS.length - 1; i >= 0; i--) {
        if (MOCK_ASSIGNMENTS[i].bookingId === id) {
          MOCK_ASSIGNMENTS.splice(i, 1);
        }
      }
      saveMockData();
    }
  }
};
