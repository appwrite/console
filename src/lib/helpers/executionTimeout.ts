import type { Models } from '@appwrite.io/console';

/**
 * Checks if an execution has exceeded the maximum execution timeout duration
 */
function isExecutionTimedOut(createdAt: string, status: string, timeoutSeconds: number): boolean {
    if (!['waiting', 'processing'].includes(status)) {
        return false;
    }

    if (!timeoutSeconds || timeoutSeconds <= 0) {
        return false;
    }

    const created = new Date(createdAt);
    const elapsedSeconds = Math.floor((Date.now() - created.getTime()) / 1000);

    return elapsedSeconds >= timeoutSeconds;
}

/**
 * Gets the effective status for an execution, considering timeout
 */
export function getEffectiveExecutionStatus(
    execution: Models.Execution,
    func: Models.Function
): string {
    const originalStatus = execution.status;
    const createdAt = execution.$createdAt;

    const timeoutSeconds = func.timeout;
    if (isExecutionTimedOut(createdAt, originalStatus, timeoutSeconds)) {
        return 'failed';
    }

    return originalStatus;
}
