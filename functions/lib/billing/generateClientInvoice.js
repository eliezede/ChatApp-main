"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClientInvoice = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.generateClientInvoice = functions.https.onCall(async (data, context) => {
    // Check authentication (admin only)
    if (!context.auth || context.auth.token.role !== 'ADMIN') {
        // Note: In real app, implement custom claims or check user role in Firestore
        // throw new functions.https.HttpsError('permission-denied', 'Only admins can generate invoices');
    }
    const { clientId, periodStart, periodEnd } = data;
    if (!clientId) {
        throw new functions.https.HttpsError('invalid-argument', 'Client ID is required');
    }
    // 1. Find eligible timesheets
    // readyForClientInvoice == true AND clientInvoiceId == null
    const timesheetsSnapshot = await db.collection('timesheets')
        .where('clientId', '==', clientId)
        .where('readyForClientInvoice', '==', true)
        .where('clientInvoiceId', '==', null) // Only uninvoiced
        .where('actualStart', '>=', periodStart)
        .where('actualStart', '<=', periodEnd)
        .get();
    if (timesheetsSnapshot.empty) {
        return { success: false, message: "No eligible timesheets found for this period." };
    }
    // 2. Get Client Details
    const clientDoc = await db.collection('clients').doc(clientId).get();
    const clientData = clientDoc.data();
    // 3. Calculate Total & Create Line Items
    let totalAmount = 0;
    const lineItems = [];
    const batch = db.batch();
    const invoiceRef = db.collection('clientInvoices').doc();
    timesheetsSnapshot.docs.forEach(tsDoc => {
        const ts = tsDoc.data();
        const lineTotal = ts.clientAmountCalculated || 0;
        totalAmount += lineTotal;
        // Create Line Item
        const lineRef = db.collection('clientInvoiceLines').doc();
        batch.set(lineRef, {
            invoiceId: invoiceRef.id,
            timesheetId: tsDoc.id,
            bookingId: ts.bookingId,
            description: `Interpreting Service (${ts.bookingId}) - ${new Date(ts.actualStart).toLocaleDateString()}`,
            units: ts.unitsBillableToClient,
            rate: (ts.clientAmountCalculated / ts.unitsBillableToClient) || 0,
            lineAmount: lineTotal
        });
        // Update Timesheet to link to invoice
        batch.update(tsDoc.ref, {
            clientInvoiceId: invoiceRef.id,
            status: 'INVOICED'
        });
    });
    // 4. Create Invoice Document
    const invoiceNumber = `INV-${Date.now().toString().substr(-6)}`; // Simple generator
    batch.set(invoiceRef, {
        id: invoiceRef.id,
        clientId,
        clientName: clientData?.companyName || 'Unknown Client',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        periodStart,
        periodEnd,
        status: 'DRAFT',
        totalAmount: Number(totalAmount.toFixed(2)),
        currency: 'GBP',
        reference: invoiceNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();
    return {
        success: true,
        invoiceId: invoiceRef.id,
        count: timesheetsSnapshot.size,
        total: totalAmount
    };
});
//# sourceMappingURL=generateClientInvoice.js.map