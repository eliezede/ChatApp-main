import { collection, doc, getDocs, getDoc, setDoc, query, where, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Booking, BookingStatus, EmailTemplate, EMAIL_VARIABLES, UserRole } from '../types';

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
        id: 'INCOMING_CLIENT',
        triggerStatus: BookingStatus.INCOMING,
        recipientType: 'CLIENT',
        name: 'Booking Received',
        subject: 'We have received your booking request: {{bookingRef}}',
        body: `Hello {{clientName}},<br><br>Thank you for booking with Lingland. We have received your request for a {{languageFrom}} to {{languageTo}} interpreter.<br><br>**Details:**<br>Date: {{date}}<br>Time: {{time}}<br>Service: {{serviceType}}<br>Location: {{location}}<br><br>We are currently matching you with an interpreter. We'll notify you as soon as one is assigned.<br><br>Best regards,<br>The Lingland Team`,
        allowedVariables: EMAIL_VARIABLES.CLIENT,
        isActive: true
    },
    {
        id: 'BOOKED_CLIENT',
        triggerStatus: BookingStatus.BOOKED,
        recipientType: 'CLIENT',
        name: 'Interpreter Assigned',
        subject: 'Booking Confirmed: Interpreter Assigned ({{bookingRef}})',
        body: `Hello {{clientName}},<br><br>Great news! An interpreter ({{interpreterName}}) has been successfully assigned to your booking.<br><br>**Details:**<br>Date: {{date}}<br>Time: {{time}}<br><br>You can view full details by logging into your dashboard.<br><br>Best regards,<br>The Lingland Team`,
        allowedVariables: EMAIL_VARIABLES.CLIENT,
        isActive: true
    },
    {
        id: 'BOOKED_INTERPRETER',
        triggerStatus: BookingStatus.BOOKED,
        recipientType: 'INTERPRETER',
        name: 'Job Confirmed',
        subject: 'Job Confirmed: You are booked for {{bookingRef}}',
        body: `Hello {{interpreterName}},<br><br>This email confirms that you are officially booked for the upcoming job ({{bookingRef}}).<br><br>**Details:**<br>Date: {{date}}<br>Time: {{time}}<br>Service: {{serviceType}}<br>Location: {{location}}<br><br>Please check your dashboard for client notes and exact address/link details.<br><br>Best regards,<br>The Lingland Team`,
        allowedVariables: EMAIL_VARIABLES.INTERPRETER,
        isActive: true
    },
    {
        id: 'OPENED_INTERPRETER',
        triggerStatus: BookingStatus.OPENED,
        recipientType: 'INTERPRETER',
        name: 'New Job Offer',
        subject: 'New Job Offer Available: {{languageTo}}',
        body: `Hello {{interpreterName}},<br><br>We have a new job offer that matches your language profile ({{languageTo}}).<br><br>**Quick Details:**<br>Date: {{date}}<br>Time: {{time}}<br>Location: {{location}}<br><br>Log in to your dashboard to accept or decline this offer.<br><br>Best regards,<br>The Lingland Team`,
        allowedVariables: EMAIL_VARIABLES.INTERPRETER,
        isActive: true
    },
    {
        id: 'CANCELLED_CLIENT',
        triggerStatus: BookingStatus.CANCELLED,
        recipientType: 'CLIENT',
        name: 'Booking Cancelled',
        subject: 'Booking Cancelled: {{bookingRef}}',
        body: `Hello {{clientName}},<br><br>Your booking ({{bookingRef}}) scheduled for {{date}} has been cancelled.<br><br>If you need further assistance, please contact support.<br><br>Best regards,<br>The Lingland Team`,
        allowedVariables: EMAIL_VARIABLES.CLIENT,
        isActive: true
    },
    {
        id: 'CANCELLED_INTERPRETER',
        triggerStatus: BookingStatus.CANCELLED,
        recipientType: 'INTERPRETER',
        name: 'Job Cancelled',
        subject: 'Job Cancelled: {{bookingRef}}',
        body: `Hello {{interpreterName}},<br><br>Please note that the booking ({{bookingRef}}) scheduled for {{date}} has been cancelled by the client or admin.<br><br>Your schedule has been freed up.<br><br>Best regards,<br>The Lingland Team`,
        allowedVariables: EMAIL_VARIABLES.INTERPRETER,
        isActive: true
    }
];

export const EmailService = {
    // Fetch active templates
    getTemplates: async (): Promise<EmailTemplate[]> => {
        try {
            const q = query(collection(db, 'emailTemplates'));
            const snapshot = await getDocs(q);

            const dbTemplates = snapshot.docs.map(doc => doc.data() as EmailTemplate);

            // Merge with defaults if not present in DB
            const result: EmailTemplate[] = [];
            for (const def of DEFAULT_TEMPLATES) {
                const found = dbTemplates.find(t => t.id === def.id);
                result.push(found || def);
            }
            return result;
        } catch (e) {
            console.error("Error fetching templates, falling back to defaults", e);
            return DEFAULT_TEMPLATES;
        }
    },

    // Save/Update template
    saveTemplate: async (template: EmailTemplate) => {
        template.updatedAt = new Date().toISOString();
        await setDoc(doc(db, 'emailTemplates', template.id), template);
    },

    // The engine that parses {{variables}} based on the entity
    parseTemplate: (text: string, booking: Booking, extraData: any = {}): string => {
        let output = text;

        // Create a dictionary of all possible variables
        const dictionary: Record<string, string> = {
            '{{clientName}}': booking.guestContact?.name || booking.clientName || 'Valued Client',
            '{{interpreterName}}': extraData.interpreterName || booking.interpreterName || 'Interpreter',
            '{{bookingRef}}': booking.bookingRef || booking.id.substring(0, 8),
            '{{date}}': new Date(booking.date).toLocaleDateString(),
            '{{time}}': booking.startTime,
            '{{location}}': booking.locationType === 'ONLINE' ? 'Remote / Online' : (booking.postcode || 'Onsite'),
            '{{languageFrom}}': booking.languageFrom,
            '{{languageTo}}': booking.languageTo,
            '{{serviceType}}': booking.serviceType,
            '{{durationMinutes}}': booking.durationMinutes.toString(),
            '{{totalAmount}}': booking.totalAmount ? `£${booking.totalAmount.toFixed(2)}` : 'TBC',
            '{{status}}': booking.status
        };

        // Replace all instances
        for (const [key, value] of Object.entries(dictionary)) {
            output = output.replace(new RegExp(key, 'g'), value);
        }

        return output;
    },

    // Core trigger mechanism called from bookingService
    // In a real production app, this writes to an 'emails' collection that a Firebase Extension (Trigger Email) listens to.
    sendStatusEmail: async (
        booking: Booking,
        newStatus: BookingStatus,
        extraData: { interpreterId?: string; interpreterName?: string; interpreterEmail?: string; clientEmail?: string } = {}
    ) => {
        console.log(`[EmailService] Triggered for status: ${newStatus}, bookingId: ${booking.id}`);
        try {
            const templates = await EmailService.getTemplates();
            console.log(`[EmailService] Found ${templates.length} templates total`);

            // Find templates that match this specific status trigger
            const matchingTemplates = templates.filter(t => t.triggerStatus === newStatus && t.isActive);
            console.log(`[EmailService] Matching templates for ${newStatus}: ${matchingTemplates.length}`);

            for (const template of matchingTemplates) {
                // Prepare content
                const subject = EmailService.parseTemplate(template.subject, booking, extraData);
                const body = EmailService.parseTemplate(template.body, booking, extraData);
                let recipientEmail = '';

                if (template.recipientType === 'CLIENT') {
                    // For guest bookings, the email is in guestContact.email
                    recipientEmail = extraData.clientEmail
                        || booking.guestContact?.email
                        || (booking as any).email
                        || '';
                    console.log(`[EmailService] Client recipient: ${recipientEmail}`);
                } else if (template.recipientType === 'INTERPRETER') {
                    recipientEmail = extraData.interpreterEmail || '';
                    console.log(`[EmailService] Interpreter recipient: ${recipientEmail}`);
                }

                if (!recipientEmail) {
                    console.warn(`[EmailService] No recipient email found for template ${template.id}, skipping.`);
                    continue;
                }

                try {
                    await addDoc(collection(db, 'mail'), {
                        to: [recipientEmail],
                        message: {
                            subject,
                            html: body
                        },
                        statusTrigger: newStatus,
                        bookingId: booking.id,
                        createdAt: new Date().toISOString()
                    });
                    console.log(`[EmailService] ✅ Email queued for ${recipientEmail} (trigger: ${newStatus})`);
                } catch (writeErr) {
                    console.error(`[EmailService] ❌ Failed to write to Firestore 'mail' collection:`, writeErr);
                }
            }
        } catch (e) {
            console.error("[EmailService] Failed to process status email trigger", e);
        }
    }
};
