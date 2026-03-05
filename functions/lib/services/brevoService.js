"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brevoService = void 0;
const axios_1 = __importDefault(require("axios"));
// Note: In production, we use Firebase Secrets Manager (BREVO_API_KEY).
const FROM_EMAIL = 'eandrade@lingland.net';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
exports.brevoService = {
    sendEmail: async (to, subject, html) => {
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
            const response = await axios_1.default.post(BREVO_API_URL, data, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[Brevo] ✅ Email sent successfully to: ${to.join(', ')}. Message ID: ${response.data?.messageId}`);
            return { success: true };
        }
        catch (error) {
            console.error('[Brevo] ❌ Failed to send email:', error.response?.data || error.message);
            throw error;
        }
    }
};
//# sourceMappingURL=brevoService.js.map