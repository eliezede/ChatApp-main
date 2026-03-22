import { ServiceType } from '../../shared/types/common';
import { InvoiceStatus } from '@/types'; // Still using legacy for now, or redefine

export interface Rate {
    id: string;
    rateType: 'CLIENT' | 'INTERPRETER';
    serviceType: ServiceType;
    amountPerUnit: number;
    minimumUnits: number;
}

export interface ProfitStats {
    clientAmount: number;
    interpreterAmount: number;
    extraCosts: number;
    profit: number;
    marginPercentage: number;
}
