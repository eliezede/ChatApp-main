import * as functions from 'firebase-functions/v1';
import { brevoService } from '../services/brevoService';

export const onEmailCreated = functions.runWith({
    secrets: ['BREVO_API_KEY'],
    timeoutSeconds: 60,
    memory: '256MB'
}).firestore
    .document('mail/{mailId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        if (!data) return null;

        const { to, message } = data;
        if (!to || !message) {
            console.warn(`[onEmailCreated] Missing to or message for ${context.params.mailId}. Data:`, data);
            return null;
        }

        const { subject, html } = message;

        try {
            console.log(`[onEmailCreated] Sending email via Brevo for: ${context.params.mailId}`);
            await brevoService.sendEmail(
                Array.isArray(to) ? to : [to],
                subject,
                html
            );

            // Update the status in the Firestore document
            return snap.ref.update({
                delivery: {
                    state: 'SUCCESS',
                    sentAt: new Date().toISOString()
                }
            });
        } catch (error: any) {
            console.error(`[onEmailCreated] ❌ Error sending email:`, error);
            return snap.ref.update({
                delivery: {
                    state: 'ERROR',
                    error: error.message,
                    errorTime: new Date().toISOString()
                }
            });
        }
    });
