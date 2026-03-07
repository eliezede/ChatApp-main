import { Organization, OrganizationSettings } from './types';

export interface OrganizationRepository {
    getById(id: string): Promise<Organization | null>;
    getBySubdomain(subdomain: string): Promise<Organization | null>;
    updateSettings(id: string, settings: Partial<OrganizationSettings>): Promise<void>;
}
