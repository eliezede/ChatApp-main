export interface InterpreterSnapshot {
    id: string;
    name: string;
    email: string;
}

export interface InterpreterRepository {
    getSnapshotById(id: string): Promise<InterpreterSnapshot | null>;
}
