
import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './billing/onTimesheetAdminApproved';
export * from './billing/generateClientInvoice';
export * from './billing/generateInterpreterInvoices';
export * from './mail/onEmailCreated';
export * from './auth/onUserCreated';
