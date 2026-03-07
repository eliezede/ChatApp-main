import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { OrganizationSettings } from '../types';

export const DEFAULT_SETTINGS: OrganizationSettings = {
    general: {
        companyName: 'Lingland',
        supportEmail: 'bookings@lingland.net',
        businessAddress: '123 Lingland St, London',
        websiteUrl: 'https://lingland.net'
    },
    finance: {
        currency: 'GBP',
        vatRate: 20,
        vatNumber: 'GB123456789',
        invoicePrefix: 'INV-',
        nextInvoiceNumber: 1000,
        paymentTermsDays: 30,
        invoiceFooterText: 'Thank you for your business. Payment is due within 30 days.'
    },
    operations: {
        minBookingDurationMinutes: 60,
        cancellationWindowHours: 24,
        timeIncrementMinutes: 15,
        defaultOnlinePlatformUrl: 'https://zoom.us'
    }
};

export const getOrganizationSettings = async (organizationId: string): Promise<OrganizationSettings> => {
    try {
        const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
        if (orgDoc.exists()) {
            return (orgDoc.data() as any).settings as OrganizationSettings;
        }
    } catch (error) {
        console.warn(`Failed to fetch settings for organization ${organizationId}, using defaults.`, error);
    }
    return DEFAULT_SETTINGS;
};
