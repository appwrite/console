export const USERS_LIMIT_MIN = 1;
export const USERS_LIMIT_MAX = 10000;

export type UsersLimitMode = 'limited' | 'unlimited';

// The API reserves `total: 0` for "no limit", so `limited` cannot represent zero.
export function usersLimitError(limit: number): string | null {
    if (!Number.isInteger(limit) || limit < USERS_LIMIT_MIN || limit > USERS_LIMIT_MAX) {
        return `Enter a whole number between ${USERS_LIMIT_MIN} and ${USERS_LIMIT_MAX}, or select "Unlimited" to allow any number of users.`;
    }

    return null;
}

export function usersLimitChanged(mode: UsersLimitMode, limit: number, total: number): boolean {
    return mode === 'limited' ? limit !== total : total !== 0;
}
