import { Job, JobAssignment } from './types';
import { JobStatus } from './status';

export interface JobRepository {
    getById(id: string): Promise<Job | null>;
    create(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job>;
    update(id: string, data: Partial<Job>): Promise<void>;
    updateStatus(id: string, newStatus: JobStatus): Promise<void>;
}

export interface AssignmentRepository {
    getByJobIdAndStatus(jobId: string, status: string): Promise<JobAssignment[]>;
    resolveAssignmentsForJob(jobId: string, acceptedInterpreterId: string): Promise<void>;
}
