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
exports.getClientInvoices = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.getClientInvoices = functions.https.onCall(async (data, context) => {
    // 1. Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    // 2. Get user details to verify role and client link
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    // 3. Verify user is authorized for this client
    // If role is CLIENT, they can only fetch their own invoices
    if (userData?.role === 'CLIENT') {
        const requestedClientId = data.clientId; // If frontend passes it, or we deduce it
        const linkedClientId = userData.profileId;
        if (!linkedClientId || (requestedClientId && requestedClientId !== linkedClientId)) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied to these invoices.');
        }
        // 4. Fetch Invoices
        const querySnapshot = await db.collection('clientInvoices')
            .where('clientId', '==', linkedClientId)
            .orderBy('issueDate', 'desc')
            .get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    else if (userData?.role === 'ADMIN') {
        // Admins can fetch any
        const clientId = data.clientId;
        if (!clientId) {
            throw new functions.https.HttpsError('invalid-argument', 'ClientId required for admin fetch.');
        }
        const querySnapshot = await db.collection('clientInvoices')
            .where('clientId', '==', clientId)
            .orderBy('issueDate', 'desc')
            .get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    else {
        throw new functions.https.HttpsError('permission-denied', 'Role not authorized.');
    }
});
