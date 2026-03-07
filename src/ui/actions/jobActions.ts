import { assignInterpreter as domainAssignInterpreter, AssignInterpreterDependencies } from '../../domains/jobs/useCases/assignInterpreter';
import { unassignInterpreter as domainUnassignInterpreter } from '../../domains/jobs/useCases/unassignInterpreter';
import { ActionDependencies } from './dependencies';

/**
 * UI Action to assign an interpreter to a job.
 * Wraps the domain use case and provides a clean interface for the UI.
 */
export const assignInterpreterAction = async (
    jobId: string,
    interpreterId: string,
    deps: ActionDependencies
): Promise<void> => {
    try {
        await domainAssignInterpreter(jobId, interpreterId, deps as AssignInterpreterDependencies);
    } catch (error) {
        console.error('Action: assignInterpreter failed', error);
        throw error;
    }
};

/**
 * UI Action to unassign an interpreter from a job.
 */
export const unassignInterpreterAction = async (
    jobId: string,
    _deps: ActionDependencies
): Promise<void> => {
    try {
        await domainUnassignInterpreter(jobId);
    } catch (error) {
        console.error('Action: unassignInterpreter failed', error);
        throw error;
    }
};

/**
 * UI Action to update a job's status.
 */
export const updateJobStatusAction = async (
    jobId: string,
    status: any,
    deps: ActionDependencies
): Promise<void> => {
    try {
        await deps.jobRepo.updateStatus(jobId, status);
    } catch (error) {
        console.error('Action: updateJobStatus failed', error);
        throw error;
    }
};
