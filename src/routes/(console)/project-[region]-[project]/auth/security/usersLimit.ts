export const USERS_LIMIT_MIN = 1;
export const USERS_LIMIT_MAX = 10000;

export type UsersLimitMode = 'limited' | 'unlimited';

export type UsersLimitState = {
    error: string | null;
    disabled: boolean;
};

// The API reserves `total: 0` for "no limit", so `limited` cannot represent zero.
function limitError(limit: number): string | null {
    if (!Number.isInteger(limit) || limit < USERS_LIMIT_MIN || limit > USERS_LIMIT_MAX) {
        return `Enter a whole number between ${USERS_LIMIT_MIN} and ${USERS_LIMIT_MAX}, or select "Unlimited" to allow any number of users.`;
    }

    return null;
}

function limitChanged(mode: UsersLimitMode, limit: number, total: number): boolean {
    return mode === 'limited' ? limit !== total : total !== 0;
}

export function usersLimitState(
    mode: UsersLimitMode,
    limit: number,
    total: number
): UsersLimitState {
    const error = mode === 'limited' ? limitError(limit) : null;

    return {
        error,
        disabled: error !== null || !limitChanged(mode, limit, total)
    };
}
