import { describe, expect, it } from 'vitest';
import { USERS_LIMIT_MAX, USERS_LIMIT_MIN, usersLimitState } from './usersLimit';

describe('usersLimitState', () => {
    describe('limited', () => {
        it('accepts whole numbers within range', () => {
            expect(usersLimitState('limited', USERS_LIMIT_MIN, 100).error).toBeNull();
            expect(usersLimitState('limited', 250, 100).error).toBeNull();
            expect(usersLimitState('limited', USERS_LIMIT_MAX, 100).error).toBeNull();
        });

        it('explains a limit of 0 instead of leaving Update dead', () => {
            const state = usersLimitState('limited', 0, 0);

            expect(state.error).toContain('Unlimited');
            expect(state.disabled).toBe(true);
        });

        it('refuses to save 0, which the API would read as no limit', () => {
            expect(usersLimitState('limited', 0, 100).disabled).toBe(true);
        });

        it('rejects a cleared field', () => {
            expect(usersLimitState('limited', undefined, 100).error).not.toBeNull();
            expect(usersLimitState('limited', NaN, 100).error).not.toBeNull();
        });

        it('rejects values outside the accepted range', () => {
            expect(usersLimitState('limited', -1, 100).error).not.toBeNull();
            expect(usersLimitState('limited', USERS_LIMIT_MAX + 1, 100).error).not.toBeNull();
            expect(usersLimitState('limited', 1.5, 100).error).not.toBeNull();
        });

        it('enables Update for a valid new limit', () => {
            expect(usersLimitState('limited', 100, 0).disabled).toBe(false);
            expect(usersLimitState('limited', 1, 100).disabled).toBe(false);
        });

        it('disables Update when the limit is unchanged', () => {
            expect(usersLimitState('limited', 100, 100).disabled).toBe(true);
        });
    });

    describe('unlimited', () => {
        it('ignores whatever the disabled limit field holds', () => {
            expect(usersLimitState('unlimited', 0, 100).error).toBeNull();
            expect(usersLimitState('unlimited', undefined, 100).error).toBeNull();
        });

        it('enables Update when a limit is being removed', () => {
            expect(usersLimitState('unlimited', 100, 100).disabled).toBe(false);
        });

        it('disables Update when there is no limit to remove', () => {
            expect(usersLimitState('unlimited', 100, 0).disabled).toBe(true);
        });
    });
});
