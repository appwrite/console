import type { Models } from '@appwrite.io/console';

/**
 * Checks if a build has exceeded the maximum build timeout duration
 */
export function isBuildTimedOut(
    createdAt: string,
    status: string,
    timeoutSeconds: number
): boolean {
    if (!['waiting', 'processing', 'building'].includes(status)) {
        return false;
    }

    if (!timeoutSeconds || timeoutSeconds <= 0) {
        return false;
    }

    const now = new Date();
    const created = new Date(createdAt);
    const elapsedSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    return elapsedSeconds > timeoutSeconds;
}

/**
 * Gets the effective status for a build, considering timeout
 */
export function getEffectiveBuildStatus(
    originalStatus: string,
    createdAt: string,
    timeoutSeconds: number
): string {
    if (isBuildTimedOut(createdAt, originalStatus, timeoutSeconds)) {
        return 'failed';
    }
    return originalStatus;
}

/**
 * Helper to get timeout value from console variables
 */
export function getBuildTimeoutSeconds(
    consoleVariables: Models.ConsoleVariables | undefined
): number {
    if (!consoleVariables?._APP_COMPUTE_BUILD_TIMEOUT) {
        return 0;
    }
    const timeout = parseInt(String(consoleVariables._APP_COMPUTE_BUILD_TIMEOUT), 10);
    return isNaN(timeout) ? 0 : timeout;
}
