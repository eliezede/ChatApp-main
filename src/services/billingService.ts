
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  addDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "./firebaseConfig";
import { 
  ClientInvoice, 
  InterpreterInvoice, 
  Timesheet, 
  InvoiceStatus, 
  BookingStatus, 
  NotificationType, 
  ServiceCategory, 
  SessionMode, 
  SageCode,
  Booking
} from "../types";
import { MOCK_TIMESHEETS, MOCK_CLIENT_INVOICES, MOCK_INTERPRETER_INVOICES, saveMockData, MOCK_BOOKINGS, MOCK_RATES, MOCK_USERS } from "./mockData";
import { convertDoc, safeFetch } from './utils';
import { NotificationService } from "./notificationService";

export const BillingService = {

  /**
   * Get summary stats for the dashboard
   */
  getDashboardStats: async () => {
    // MOCK IMPLEMENTATION FOR DASHBOARD IF DB FAILS OR EMPTY
    // In real implementation, use the Firestore logic below
    try {
      // 1. Pending Client Invoices
      const clientInvQuery = query(collection(db, "clientInvoices"), where("status", "in", [InvoiceStatus.DRAFT, InvoiceStatus.SENT]));
      const clientInvSnap = await getDocs(clientInvQuery);

      // 2. Pending Interpreter Invoices
      const interpInvQuery = query(collection(db, "interpreterInvoices"), where("status", "==", InvoiceStatus.SUBMITTED));
      const interpInvSnap = await getDocs(interpInvQuery);

      // 3. Timesheets awaiting approval
      const tsQuery = query(collection(db, "timesheets"), where("adminApproved", "==", false), where("status", "==", "SUBMITTED"));
      const tsSnap = await getDocs(tsQuery);

      return {
        pendingClientInvoices: clientInvSnap.size,
        pendingClientAmount: clientInvSnap.docs.reduce((acc, d) => acc + (d.data().totalAmount || 0), 0),
        pendingInterpreterInvoices: interpInvSnap.size,
        pendingTimesheets: tsSnap.size
      };
    } catch (e) {
      console.warn("Firestore billing stats failed, falling back to mock data", e);
      return {
        pendingClientInvoices: 5,
        pendingClientAmount: 1250.00,
        pendingInterpreterInvoices: 2,
        pendingTimesheets: 3
      };
    }
  },

  /**
   * Client Invoices
   */
  getClientInvoices: async (statusFilter?: string) => {
    try {
      let q = query(collection(db, "clientInvoices"), orderBy("issueDate", "desc"));
      if (statusFilter && statusFilter !== 'ALL') {
        q = query(collection(db, "clientInvoices"), where("status", "==", statusFilter), orderBy("issueDate", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientInvoice));
    } catch (e) {
      console.warn("Using Mock Client Invoices");
      return [...MOCK_CLIENT_INVOICES];
    }
  },

  getClientInvoiceById: async (id: string) => {
    try {
      const d = await getDoc(doc(db, "clientInvoices", id));
      if (!d.exists()) return MOCK_CLIENT_INVOICES.find(i => i.id === id) || null;

      const linesQ = query(collection(db, "clientInvoiceLines"), where("invoiceId", "==", id));
      const linesSnap = await getDocs(linesQ);
      const items = linesSnap.docs.map(l => ({ id: l.id, ...l.data() }));

      return { id: d.id, ...d.data(), items } as any as ClientInvoice;
    } catch (e) {
      return MOCK_CLIENT_INVOICES.find(i => i.id === id) || null;
    }
  },

  updateClientInvoiceStatus: async (id: string, status: InvoiceStatus) => {
    try {
      await updateDoc(doc(db, "clientInvoices", id), { status });
    } catch (e) {
      const inv = MOCK_CLIENT_INVOICES.find(i => i.id === id);
      if (inv) { inv.status = status; saveMockData(); }
    }
  },

  generateClientInvoice: async (clientId: string, periodStart?: string, periodEnd?: string) => {
    try {
      const functions = getFunctions();
      const generateFn = httpsCallable(functions, 'generateClientInvoice');
      const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const end = periodEnd || new Date().toISOString();
      const result = await generateFn({ clientId, periodStart: start, periodEnd: end });
      return result.data as any;
    } catch (e) {
      console.error("Function call failed, falling back to mock generation", e);
      // Mock logic for offline dev
      const ref = `INV-${Math.floor(Math.random() * 10000)}`;
      // Mock data for client and total/dueDate are not available in this scope,
      // so we'll use placeholders that match the original mock logic where possible.
      // The instruction implies these variables exist in the context of the full function.
      // For now, we'll use the original mock values for clientName, total, and dueDate.
      const client = { companyName: 'Mock Client' }; // Placeholder for client object
      const total = 150.00; // Placeholder for total amount
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Placeholder for dueDate
      const newInvoice: ClientInvoice = {
        id: `inv-c-${Date.now()}`,
        organizationId: 'org-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientId,
        clientName: client?.companyName || 'Client',
        reference: `INV-${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        status: InvoiceStatus.DRAFT,
        issueDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        periodStart: periodStart || new Date().toISOString(),
        periodEnd: periodEnd || new Date().toISOString(),
        totalAmount: total,
        currency: 'GBP',
        items: []
      } as ClientInvoice;
      MOCK_CLIENT_INVOICES.push(newInvoice);
      saveMockData();
      return { success: true, total: 150.00, invoiceId: newInvoice.id };
    }
  },

  /**
   * Interpreter Invoices
   */
  getInterpreterInvoices: async (statusFilter?: string) => {
    try {
      let q = query(collection(db, "interpreterInvoices"), orderBy("issueDate", "desc"));
      if (statusFilter && statusFilter !== 'ALL') {
        q = query(collection(db, "interpreterInvoices"), where("status", "==", statusFilter), orderBy("issueDate", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as InterpreterInvoice));
    } catch (e) {
      return [...MOCK_INTERPRETER_INVOICES];
    }
  },

  getInterpreterInvoiceById: async (id: string) => {
    try {
      const d = await getDoc(doc(db, "interpreterInvoices", id));
      if (!d.exists()) return MOCK_INTERPRETER_INVOICES.find(i => i.id === id) || null;

      const linesQ = query(collection(db, "interpreterInvoiceLines"), where("interpreterInvoiceId", "==", id));
      const linesSnap = await getDocs(linesQ);
      const items = linesSnap.docs.map(l => ({ id: l.id, ...l.data() }));

      return { id: d.id, ...d.data(), items } as any as InterpreterInvoice;
    } catch (e) {
      return MOCK_INTERPRETER_INVOICES.find(i => i.id === id) || null;
    }
  },

  updateInterpreterInvoiceStatus: async (id: string, status: InvoiceStatus) => {
    try {
      await updateDoc(doc(db, "interpreterInvoices", id), { status });
    } catch (e) {
      const inv = MOCK_INTERPRETER_INVOICES.find(i => i.id === id);
      if (inv) { inv.status = status; saveMockData(); }
    }
  },

  createInterpreterInvoiceUpload: async (interpreterId: string, timesheetIds: string[], ref: string, amount: number): Promise<InterpreterInvoice> => {
    // Mock Implementation
    const newInvoice: InterpreterInvoice = {
      id: `inv-i-${Date.now()}`,
      organizationId: 'org-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interpreterId,
      interpreterName: 'Interpreter', // Mock
      model: 'UPLOAD',
      status: InvoiceStatus.SUBMITTED,
      externalInvoiceReference: ref,
      totalAmount: amount,
      issueDate: new Date().toISOString(),
      items: [],
      currency: 'GBP'
    };

    timesheetIds.forEach(tsId => {
      const ts = MOCK_TIMESHEETS.find(t => t.id === tsId);
      if (ts) ts.interpreterInvoiceId = newInvoice.id;
    });

    MOCK_INTERPRETER_INVOICES.push(newInvoice);
    saveMockData();
    return newInvoice;
  },

  /**
   * Timesheets
   */
  getAllTimesheets: async (): Promise<Timesheet[]> => {
    return safeFetch(async () => {
      const snap = await getDocs(collection(db, 'timesheets'));
      return snap.docs.map(d => convertDoc<Timesheet>(d));
    }, MOCK_TIMESHEETS);
  },

  getTimesheetByBookingId: async (bookingId: string): Promise<Timesheet | null> => {
    try {
      const q = query(collection(db, "timesheets"), where("bookingId", "==", bookingId));
      const snap = await getDocs(q);
      if (snap.empty) {
        return MOCK_TIMESHEETS.find(t => t.bookingId === bookingId) || null;
      }
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as Timesheet;
    } catch (e) {
      return MOCK_TIMESHEETS.find(t => t.bookingId === bookingId) || null;
    }
  },

  getPendingTimesheets: async () => {
    try {
      const q = query(collection(db, "timesheets"), where("adminApproved", "==", false), where("status", "==", "SUBMITTED"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Timesheet));
    } catch (e) {
      return MOCK_TIMESHEETS.filter(t => t.status === 'SUBMITTED' && !t.adminApproved);
    }
  },

  approveTimesheet: async (id: string) => {
    try {
      const tsDoc = await getDoc(doc(db, "timesheets", id));
      if (!tsDoc.exists()) throw new Error("Timesheet not found");
      const ts = tsDoc.data() as Timesheet;

      const batch = writeBatch(db);
      batch.update(tsDoc.ref, {
        adminApproved: true,
        adminApprovedAt: new Date().toISOString(),
        status: 'INVOICING'
      });

      if (ts.bookingId) {
        batch.update(doc(db, 'bookings', ts.bookingId), {
          status: BookingStatus.READY_FOR_INVOICE,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      // Notify Interpreter
      if (ts.interpreterId) {
        // Find user by profileId
        const q = query(collection(db, 'users'), where('profileId', '==', ts.interpreterId));
        const userSnap = await getDocs(q);
        const userId = !userSnap.empty ? userSnap.docs[0].id : MOCK_USERS.find(u => u.profileId === ts.interpreterId)?.id;

        if (userId) {
          await NotificationService.notify(
            userId,
            'Timesheet Approved',
            `Your timesheet for job on ${ts.actualStart.split('T')[0]} has been verified and approved for billing.`,
            NotificationType.SUCCESS,
            '/interpreter/timesheets'
          );
        }
      }
    } catch (e) {
      console.error("Error approving timesheet:", e);
      const ts = MOCK_TIMESHEETS.find(t => t.id === id);
      if (ts) {
        ts.adminApproved = true;
        ts.status = 'INVOICING';
        ts.readyForClientInvoice = true;
        ts.readyForInterpreterInvoice = true;

        const b = MOCK_BOOKINGS.find(book => book.id === ts.bookingId);
        if (b) b.status = BookingStatus.READY_FOR_INVOICE;

        saveMockData();
      }
    }
  },

  approveTimesheetByBookingId: async (bookingId: string) => {
    try {
      const q = query(collection(db, "timesheets"), where("bookingId", "==", bookingId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await BillingService.approveTimesheet(snap.docs[0].id);
      } else {
        await updateDoc(doc(db, 'bookings', bookingId), {
          status: BookingStatus.READY_FOR_INVOICE,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      // Mock fallback
      const ts = MOCK_TIMESHEETS.find(t => t.bookingId === bookingId);
      if (ts) await BillingService.approveTimesheet(ts.id);
      else {
        const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
        if (b) { b.status = BookingStatus.READY_FOR_INVOICE; saveMockData(); }
      }
    }
  },

  getInterpreterTimesheets: async (interpreterId: string): Promise<Timesheet[]> => {
    return safeFetch(async () => {
      const q = query(collection(db, 'timesheets'), where('interpreterId', '==', interpreterId));
      const snap = await getDocs(q);
      return snap.docs.map(d => convertDoc<Timesheet>(d));
    }, MOCK_TIMESHEETS.filter(t => t.interpreterId === interpreterId));
  },

  getInterpreterEarnings: async (interpreterId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, "timesheets"),
        where("interpreterId", "==", interpreterId),
        where("adminApproved", "==", true)
      );
      const snap = await getDocs(q);
      const total = snap.docs.reduce((acc, d) => acc + (d.data().totalInterpreterAmount || 0), 0);
      return total;
    } catch (e) {
      return 340.50; // Mock fallback
    }
  },

  getUninvoicedTimesheetsForInterpreter: async (interpreterId: string): Promise<Timesheet[]> => {
    return safeFetch(async () => {
      const q = query(
        collection(db, 'timesheets'),
        where('interpreterId', '==', interpreterId),
        where('adminApproved', '==', true)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => convertDoc<Timesheet>(d));
      return all.filter(t => !t.interpreterInvoiceId);
    }, MOCK_TIMESHEETS.filter(t => t.interpreterId === interpreterId && t.adminApproved && !t.interpreterInvoiceId));
  },

  submitTimesheet: async (data: Partial<Timesheet>): Promise<Timesheet> => {
    const newTs = {
      bookingId: data.bookingId!,
      interpreterId: data.interpreterId!,
      clientId: data.clientId!,
      submittedAt: new Date().toISOString(),
      sessionMode: data.sessionMode || SessionMode.F2F,
      actualStart: data.actualStart || new Date().toISOString(),
      actualEnd: data.actualEnd || new Date().toISOString(),
      sessionDurationMinutes: data.sessionDurationMinutes || 0,
      sessionFees: data.sessionFees || 0,
      travelTimeMinutes: data.travelTimeMinutes || 0,
      travelFees: data.travelFees || 0,
      mileage: data.mileage || 0,
      mileageFees: data.mileageFees || 0,
      parking: data.parking || 0,
      transport: data.transport || 0,
      totalToPay: data.totalToPay || 0,
      breakDurationMinutes: data.breakDurationMinutes || 0,
      // Translation-specific fields
      wordCount: data.wordCount || 0,
      unitPrice: data.unitPrice || 0,
      units: data.units || 'hours',
      interpreterAmountCalculated: data.interpreterAmountCalculated || 0,
      clientAmountCalculated: data.clientAmountCalculated || 0,
      adminApproved: false,
      status: 'SUBMITTED' as const,
      readyForClientInvoice: false,
      readyForInterpreterInvoice: false,
      unitsBillableToClient: 0,
      unitsPayableToInterpreter: 0,
      supportingDocumentUrl: data.supportingDocumentUrl
    };
    try {
      const batch = writeBatch(db);
      const tsRef = doc(collection(db, 'timesheets'));
      batch.set(tsRef, newTs);

      if (data.bookingId) {
        batch.update(doc(db, 'bookings', data.bookingId), {
          status: 'TIMESHEET_SUBMITTED',
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      return { id: tsRef.id, ...newTs } as Timesheet;
    } catch {
      const mockTs = { id: `ts-${Date.now()}`, ...newTs } as Timesheet;
      MOCK_TIMESHEETS.push(mockTs);
      saveMockData();
      return mockTs;
    }
  },

  calculateBookingTotal: async (bookingId: string): Promise<number> => {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (!bookingDoc.exists()) return 0;
      const data = bookingDoc.data();
      
      // Markup logic from Airtable: interpreterCost + margin
      // margin is £21 for OOH, £17 for standard
      const margin = data.isOOH ? 21 : 17;
      
      // Calculate based on duration (h) * interpreterRate + margin
      const durationHours = (data.durationMinutes || 60) / 60;
      const interpreterRate = 25; // Default mock; in reality fetch from interpreter/rates
      
      const subtotal = (durationHours * interpreterRate) + margin;
      const vat = subtotal * 0.20;
      
      return Number((subtotal + vat).toFixed(2));
    } catch {
      const b = MOCK_BOOKINGS.find(book => book.id === bookingId);
      if (!b) return 0;
      const margin = b.isOOH ? 21 : 17;
      const subtotal = (b.durationMinutes / 60 * 25) + margin;
      return Number((subtotal * 1.20).toFixed(2));
    }
  },

  calculateBookingTotalSync: (booking: Booking): number => {
    if (!booking) return 0;
    // Markup logic from Airtable: interpreterCost + margin
    const margin = booking.isOOH ? 21 : 17;
    
    // Calculate based on duration (h) * interpreterRate + margin
    const durationHours = (booking.durationMinutes || 60) / 60;
    const interpreterRate = 25; // Default mock; in reality fetch from interpreter/rates
    
    const subtotal = (durationHours * interpreterRate) + margin;
    const vat = subtotal * 0.20;
    
    return Number((subtotal + vat).toFixed(2));
  },

  getSageCode: (category: ServiceCategory, mode: SessionMode, isOOH: boolean): SageCode => {
    if (category === ServiceCategory.TRANSLATION) return SageCode.I010;
    
    if (mode === SessionMode.VIDEO) return isOOH ? SageCode.I008 : SageCode.I002;
    if (mode === SessionMode.PHONE) return isOOH ? SageCode.I009 : SageCode.I003;
    
    // Default F2F
    return isOOH ? SageCode.I007 : SageCode.I001;
  }
};
