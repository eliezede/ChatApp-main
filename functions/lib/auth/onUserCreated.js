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
exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
exports.onUserCreated = functions.runWith({
    timeoutSeconds: 60,
    memory: '256MB'
}).firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
    const userData = snap.data();
    if (!userData)
        return null;
    const { email, displayName, role } = userData;
    if (!email) {
        console.warn(`[onUserCreated] No email for user ${context.params.userId}`);
        return null;
    }
    try {
        // 1. Check if user already exists in Firebase Auth
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`[onUserCreated] User ${email} already exists in Auth.`);
        }
        catch (authErr) {
            if (authErr.code === 'auth/user-not-found') {
                // 2. Create the user in Firebase Auth
                console.log(`[onUserCreated] Creating Auth user for ${email}...`);
                userRecord = await admin.auth().createUser({
                    email,
                    displayName: displayName || email.split('@')[0],
                    password: Math.random().toString(36).slice(-12) + '!', // Random temporary password
                });
            }
            else {
                throw authErr;
            }
        }
        // 3. Generate Link (Set password / reset password)
        console.log(`[onUserCreated] Generating activation link for ${email}...`);
        const actionCodeSettings = {
            url: 'https://lingland-platform.web.app/login', // Redirect after password set
        };
        const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
        // 4. Send the activation email (via 'mail' collection trigger)
        console.log(`[onUserCreated] Queueing activation email for ${email}`);
        await admin.firestore().collection('mail').add({
            to: [email],
            message: {
                subject: 'Welcome to Lingland - Activate your Account',
                html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
                            <h1 style="color: #2563eb;">Welcome to Lingland!</h1>
                            <p>Hello ${displayName || 'there'},</p>
                            <p>Your professional account on the Lingland Platform has been provisioned.</p>
                            <p><strong>To access your dashboard, you must first set your password:</strong></p>
                            <div style="margin: 30px 0;">
                                <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Set My Password</a>
                            </div>
                            <p style="font-size: 12px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="font-size: 11px; word-break: break-all; color: #3b82f6;">${link}</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                            <p style="font-size: 14px;">Once your password is set, you can log in at <a href="https://lingland-platform.web.app">lingland-platform.web.app</a> using your email: <strong>${email}</strong></p>
                            <p>We look forward to working with you!</p>
                            <p>Best regards,<br>The Lingland Team</p>
                        </div>
                    `,
            },
            createdAt: new Date().toISOString()
        });
        return true;
    }
    catch (error) {
        console.error(`[onUserCreated] ❌ Error provisioning user ${email}:`, error);
        return null;
    }
});
//# sourceMappingURL=onUserCreated.js.map