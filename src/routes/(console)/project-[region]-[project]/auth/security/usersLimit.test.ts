import { describe, expect, it } from 'vitest';
import {
    USERS_LIMIT_MAX,
    USERS_LIMIT_MIN,
    usersLimitChanged,
    usersLimitError,
    type UsersLimitMode
} from './usersLimit';

describe('usersLimitError', () => {
    it('accepts whole numbers within range', () => {
        expect(usersLimitError(USERS_LIMIT_MIN)).toBeNull();
        expect(usersLimitError(100)).toBeNull();
        expect(usersLimitError(USERS_LIMIT_MAX)).toBeNull();
    });

    it('rejects zero, which the API reads as no limit', () => {
        expect(usersLimitError(0)).not.toBeNull();
    });

    it('rejects a cleared input', () => {
        expect(usersLimitError(undefined)).not.toBeNull();
        expect(usersLimitError(NaN)).not.toBeNull();
    });

    it('rejects values outside the accepted range', () => {
        expect(usersLimitError(-1)).not.toBeNull();
        expect(usersLimitError(USERS_LIMIT_MAX + 1)).not.toBeNull();
        expect(usersLimitError(1.5)).not.toBeNull();
    });
});

describe('usersLimitChanged', () => {
    it('detects a new limit on a limited project', () => {
        expect(usersLimitChanged('limited', 200, 100)).toBe(true);
        expect(usersLimitChanged('limited', 100, 100)).toBe(false);
    });

    it('detects switching between limited and unlimited', () => {
        expect(usersLimitChanged('limited', 100, 0)).toBe(true);
        expect(usersLimitChanged('unlimited', 100, 100)).toBe(true);
        expect(usersLimitChanged('unlimited', 100, 0)).toBe(false);
    });
});

describe('update button state', () => {
    const isDisabled = (mode: UsersLimitMode, limit: number, total: number) =>
        (mode === 'limited' && usersLimitError(limit) !== null) ||
        !usersLimitChanged(mode, limit, total);

    it('explains a limit of 0 instead of silently blocking the update', () => {
        expect(isDisabled('limited', 0, 0)).toBe(true);
        expect(usersLimitError(0)).toContain('Unlimited');
    });

    it('never submits a limit of 0 as a limit', () => {
        expect(isDisabled('limited', 0, 100)).toBe(true);
    });

    it('enables the update for a valid change', () => {
        expect(isDisabled('limited', 100, 0)).toBe(false);
        expect(isDisabled('limited', 1, 100)).toBe(false);
        expect(isDisabled('unlimited', 100, 100)).toBe(false);
    });

    it('ignores the limit field while unlimited is selected', () => {
        expect(isDisabled('unlimited', 0, 100)).toBe(false);
        expect(isDisabled('unlimited', 0, 0)).toBe(true);
    });
});
