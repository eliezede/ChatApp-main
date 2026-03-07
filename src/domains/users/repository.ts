export interface UserSnapshot {
    id: string;
    email?: string;
    displayName?: string;
}

export interface UserRepository {
    getByProfileId(profileId: string): Promise<UserSnapshot | null>;
}
