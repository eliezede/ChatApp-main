import { createJobFirestoreRepository, createAssignmentFirestoreRepository } from '../../infrastructure/firestore/jobs/jobFirestoreRepository';
import { interpreterFirestoreRepository } from '../../infrastructure/firestore/interpreters/interpreterFirestoreRepository';
import { userFirestoreRepository } from '../../infrastructure/firestore/users/userFirestoreRepository';
import { JobRepository, AssignmentRepository } from '../../domains/jobs/repository';
import { InterpreterRepository } from '../../domains/interpreters/repository';
import { UserRepository } from '../../domains/users/repository';

export interface ActionDependencies {
    jobRepo: JobRepository;
    assignmentRepo: AssignmentRepository;
    interpreterRepo: InterpreterRepository;
    userRepo: UserRepository;
}

/**
 * Creates dependencies scoped to a specific organization (tenant).
 */
export const createDependencies = (organizationId: string): ActionDependencies => ({
    jobRepo: createJobFirestoreRepository(organizationId),
    assignmentRepo: createAssignmentFirestoreRepository(organizationId),
    interpreterRepo: interpreterFirestoreRepository,
    userRepo: userFirestoreRepository,
});
