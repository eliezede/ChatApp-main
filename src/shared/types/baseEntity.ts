export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface TenantScopedEntity extends BaseEntity {
    organizationId: string;
}
