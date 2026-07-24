/**
 * Helpers for self-hosted console (platform) user management.
 *
 * Console accounts live in the special `console` project. Organization owners
 * can manage them via the Users API when the request includes an organization
 * context (X-Appwrite-Organization). Permanent deletion is intentionally only
 * surfaced in the self-hosted console UI.
 */

export type ConsoleUserDeletionMode = 'membership_only' | 'permanent';

/**
 * Decide whether permanent console-account deletion is allowed for the current
 * actor and target membership.
 *
 * Fail closed: missing actor id, missing target id, or non-self-hosted → false.
 */
export function canPermanentlyDeleteConsoleUser(params: {
    isSelfHosted: boolean;
    actorUserId?: string | null;
    targetUserId?: string | null;
}): boolean {
    const { isSelfHosted, actorUserId, targetUserId } = params;

    if (!isSelfHosted) {
        return false;
    }

    if (!targetUserId || !actorUserId) {
        return false;
    }

    // Never allow deleting your own account from the org/member management UI.
    if (actorUserId === targetUserId) {
        return false;
    }

    return true;
}

/**
 * Resolve the effective deletion mode from UI state.
 */
export function resolveConsoleUserDeletionMode(params: {
    permanentlyDeleteRequested: boolean;
    canPermanentlyDelete: boolean;
}): ConsoleUserDeletionMode {
    if (params.permanentlyDeleteRequested && params.canPermanentlyDelete) {
        return 'permanent';
    }

    return 'membership_only';
}
