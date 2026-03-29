import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

export const onUserCreated = functions.runWith({
    secrets: ['BREVO_API_KEY'],
    timeoutSeconds: 60,
    memory: '256MB'
}).firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userData = snap.data();
        if (!userData) return null;

        const { email, displayName, role, status } = userData;
        if (!email) {
            console.warn(`[onUserCreated] No email for user ${context.params.userId}`);
            return null;
        }

        // Only process PENDING users (invites). Already ACTIVE users don't need provisioning.
        if (status && status !== 'PENDING') {
            console.log(`[onUserCreated] User ${email} status is ${status}, skipping provisioning.`);
            return null;
        }

        try {
            // 1. Check if user already exists in Firebase Auth
            let userRecord;
            try {
                userRecord = await admin.auth().getUserByEmail(email);
                console.log(`[onUserCreated] User ${email} already exists in Auth.`);
            } catch (authErr: any) {
                if (authErr.code === 'auth/user-not-found') {
                    // 2. Create the user in Firebase Auth with a random temporary password
                    console.log(`[onUserCreated] Creating Auth user for ${email}...`);
                    userRecord = await admin.auth().createUser({
                        email,
                        displayName: displayName || email.split('@')[0],
                        password: Math.random().toString(36).slice(-12) + 'A1!',
                    });
                } else {
                    throw authErr;
                }
            }

            const authUid = userRecord.uid;
            
            // 3. ID ALIGNMENT: Migrate Firestore doc to match Auth UID
            if (authUid !== context.params.userId) {
                console.log(`[onUserCreated] ID Mismatch. Migrating ${context.params.userId} → ${authUid} atomically...`);
                
                const departmentId = userData._prov_departmentId || '';
                const jobTitleId = userData._prov_jobTitleId || '';

                const batch = admin.firestore().batch();

                const profileRef = admin.firestore().collection('staff_profiles').doc();
                batch.set(profileRef, {
                    id: profileRef.id,
                    userId: authUid,
                    departmentId,
                    jobTitleId,
                    onboardingCompleted: false,
                    preferences: { theme: 'system', language: 'en', notifications: true },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                const { _prov_departmentId, _prov_jobTitleId, ...cleanUserData } = userData;
                const newUserRef = admin.firestore().collection('users').doc(authUid);
                batch.set(newUserRef, {
                    ...cleanUserData,
                    id: authUid,
                    staffProfileId: profileRef.id
                }, { merge: true });
                
                const oldUserRef = admin.firestore().collection('users').doc(context.params.userId);
                batch.delete(oldUserRef);

                await batch.commit();
                console.log(`[onUserCreated] Atomic ID Alignment & profile creation complete for ${email}.`);
            }

            await sendInvitationEmail(authUid, email, displayName, role);

            return true;
        } catch (error: any) {
            console.error(`[onUserCreated] ❌ Error provisioning user ${email}:`, error);
            await admin.firestore().collection('users').doc(context.params.userId).update({
                error: error?.message || 'Unknown error provisioning user'
            });
            return null;
        }
    });

export const resendStaffInvite = functions.runWith({ secrets: ['BREVO_API_KEY'] }).https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');

    const callerRef = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!callerRef.exists || callerRef.data()?.role !== 'SUPER_ADMIN') {
        throw new functions.https.HttpsError('permission-denied', 'Only SUPER_ADMIN can resend invites');
    }

    const { userId } = data;
    if (!userId) throw new functions.https.HttpsError('invalid-argument', 'userId is required');

    const userRef = await admin.firestore().collection('users').doc(userId).get();
    if (!userRef.exists) throw new functions.https.HttpsError('not-found', 'User not found');

    const userData = userRef.data()!;
    if (userData.status !== 'PENDING') throw new functions.https.HttpsError('failed-precondition', 'User is not pending');

    await sendInvitationEmail(userData.id, userData.email, userData.displayName, userData.role);
    return { success: true };
});

async function sendInvitationEmail(authUid: string, email: string, displayName: string, role: string) {
    const productionUrl = 'https://lingland-2e52f.web.app';
    console.log(`[sendInvitationEmail] Generating password reset link for ${email}...`);
    
    const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${productionUrl}/#/setup?token=${authUid}`,
    });

    // Extract oobCode from the Firebase reset link
    const url = new URL(resetLink);
    const oobCode = url.searchParams.get('oobCode') || '';
    
    // Build our custom setup link with both token (authUid) and oobCode
    const setupLink = `${productionUrl}/#/setup?token=${authUid}&oobCode=${oobCode}`;
    console.log(`[sendInvitationEmail] Custom setup link generated for ${email}`);

    // Determine role label for email
    const roleLabels: Record<string, string> = {
        'SUPER_ADMIN': 'Super Administrator',
        'ADMIN': 'Administrator',
        'INTERPRETER': 'Interpreter',
        'CLIENT': 'Client'
    };
    const roleLabel = roleLabels[role] || role || 'Team Member';

    console.log(`[sendInvitationEmail] Queueing branded invitation email for ${email}`);
    await admin.firestore().collection('mail').add({
        to: [email],
        message: {
            subject: 'Welcome to Lingland – Complete Your Account Setup',
            html: `
                <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 32px; border-radius: 16px 16px 0 0;">
                        <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                            <span style="color: white; font-size: 24px; font-weight: 900;">L</span>
                        </div>
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                            Welcome to Lingland
                        </h1>
                        <p style="color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.6;">
                            Your professional account has been created and is ready for activation.
                        </p>
                    </div>

                    <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
                        <p style="color: #1e293b; font-size: 15px; line-height: 1.7; margin: 0 0 8px 0;">
                            Hello <strong>${displayName || 'there'}</strong>,
                        </p>
                        <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                            You have been invited to join the Lingland platform as a <strong>${roleLabel}</strong>.
                            To get started, click the button below to set your password and complete your onboarding.
                        </p>

                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${setupLink}" 
                               style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; 
                                      text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px;
                                      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                Set My Password &amp; Join Team →
                            </a>
                        </div>

                        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0 0 0; border: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                Account Details
                            </p>
                            <p style="color: #1e293b; font-size: 14px; margin: 4px 0;">
                                <strong>Email:</strong> ${email}
                            </p>
                            <p style="color: #1e293b; font-size: 14px; margin: 4px 0;">
                                <strong>Role:</strong> ${roleLabel}
                            </p>
                        </div>

                        <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0; line-height: 1.6;">
                            This link is valid for a limited time. If it expires, please contact your administrator for a new invitation.
                        </p>

                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

                        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                            Lingland Platform · Professional Language Services
                        </p>
                    </div>
                </div>
            `,
        },
        createdAt: new Date().toISOString()
    });

    console.log(`[sendInvitationEmail] ✅ Invitation email queued for ${email}`);
}
