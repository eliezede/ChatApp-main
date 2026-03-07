export interface OrganizationSettings {
    general: {
        companyName: string;
        supportEmail: string;
        businessAddress: string;
        websiteUrl: string;
        logoUrl?: string;
    };
    finance: {
        currency: string;
        vatRate: number;
        vatNumber: string;
        invoicePrefix: string;
        nextInvoiceNumber: number;
        paymentTermsDays: number;
        invoiceFooterText: string;
    };
    operations: {
        minBookingDurationMinutes: number;
        cancellationWindowHours: number;
        timeIncrementMinutes: number;
        defaultOnlinePlatformUrl: string;
    };
}

export interface Organization {
    id: string; // The organizationId used across the app (tenant id)
    name: string;
    subdomain: string; // e.g. 'lingland' or 'agencyx'
    isActive: boolean;
    settings: OrganizationSettings;
    createdAt: string;
    updatedAt: string;
}
