"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendgridService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Note: In production, we use Firebase Secrets Manager (SENDGRID_API_KEY).
const FROM_EMAIL = 'no-reply@lingland.net';
exports.sendgridService = {
    sendEmail: async (to, subject, html) => {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            console.error('[SendGrid] API Key not set. Please add SENDGRID_API_KEY to Firebase secrets.');
            return;
        }
        mail_1.default.setApiKey(apiKey);
        const msg = {
            to,
            from: {
                email: FROM_EMAIL,
                name: 'Lingland Platform'
            },
            subject,
            html
        };
        try {
            await mail_1.default.send(msg);
            console.log(`[SendGrid] ✅ Email sent successfully to: ${to.join(', ')}`);
            return { success: true };
        }
        catch (error) {
            console.error('[SendGrid] ❌ Failed to send email:', error);
            if (error.response) {
                console.error('[SendGrid] Error Response:', error.response.body);
            }
            throw error;
        }
    }
};
