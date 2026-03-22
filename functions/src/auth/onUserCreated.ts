import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

export const onUserCreated = functions.runWith({
    timeoutSeconds: 60,
    memory: '256MB'
}).firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userData = snap.data();
        if (!userData) return null;

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
            } catch (authErr: any) {
                if (authErr.code === 'auth/user-not-found') {
                    // 2. Create the user in Firebase Auth
                    console.log(`[onUserCreated] Creating Auth user for ${email}...`);
                    userRecord = await admin.auth().createUser({
                        email,
                        displayName: displayName || email.split('@')[0],
                        password: Math.random().toString(36).slice(-12) + '!', // Random temporary password
                    });
                } else {
                    throw authErr;
                }
            }

            const authUid = userRecord.uid;
            
            // 3. IMPORTANT: ID ALIGNMENT
            // If the current Firestore document ID is NOT the Auth UID, we must migrate it.
            // This ensures AuthContext.tsx can fetch the user by UID upon login.
            if (authUid !== context.params.userId) {
                console.log(`[onUserCreated] ID Mismatch Detected. Migrating ${context.params.userId} to ${authUid}...`);
                await admin.firestore().collection('users').doc(authUid).set({
                    ...userData,
                    id: authUid // Update ID within the document
                }, { merge: true });
                
                // Delete the temporary (random ID) document
                await admin.firestore().collection('users').doc(context.params.userId).delete();
                console.log(`[onUserCreated] ID Alignment complete for ${email}.`);
            }

            // 4. Generate Activation Link
            console.log(`[onUserCreated] Generating activation link for ${email}...`);
            const actionCodeSettings = {
                url: 'https://lingland-platform.web.app/login',
            };
            const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

            // 5. Send Activation Email
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
                            <p style="font-size: 14px;">Once your password is set, you can log in using your email: <strong>${email}</strong></p>
                            <p>Best regards,<br>The Lingland Team</p>
                        </div>
                    `,
                },
                createdAt: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error(`[onUserCreated] ❌ Error provisioning user ${email}:`, error);
            return null;
        }
    });
