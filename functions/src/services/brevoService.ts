import axios from 'axios';

// Note: In production, we use Firebase Secrets Manager (BREVO_API_KEY).
const FROM_EMAIL = 'eandrade@lingland.net';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const brevoService = {
    sendEmail: async (to: string[], subject: string, html: string): Promise<any> => {
        const rawApiKey = (process.env.BREVO_API_KEY || '').trim();
        // Remove ANY character that is not a standard printable ASCII character (0x21 to 0x7E)
        const apiKey = rawApiKey.replace(/[^\x21-\x7E]/g, '');

        if (!apiKey) {
            console.error('[Brevo] API Key not set or empty after cleaning.');
            return;
        }

        const maskedKey = `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`;
        console.log(`[Brevo] Sending email. Key length: ${apiKey.length}. Key format: ${maskedKey}`);

        const data = {
            sender: {
                name: 'Lingland Platform',
                email: FROM_EMAIL
            },
            to: to.map(email => ({ email })),
            subject,
            htmlContent: html
        };

        try {
            const response = await axios.post(BREVO_API_URL, data, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[Brevo] ✅ Email sent successfully to: ${to.join(', ')}. Message ID: ${response.data?.messageId}`);
            return { success: true };
        } catch (error: any) {
            console.error('[Brevo] ❌ Failed to send email:', error.response?.data || error.message);
            throw error;
        }
    }
};
