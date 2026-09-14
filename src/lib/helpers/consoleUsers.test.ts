import { describe, expect, it } from 'vitest';
import {
    canPermanentlyDeleteConsoleUser,
    resolveConsoleUserDeletionMode
} from './consoleUsers';

describe('canPermanentlyDeleteConsoleUser', () => {
    it('allows permanent delete on self-hosted for another user', () => {
        expect(
            canPermanentlyDeleteConsoleUser({
                isSelfHosted: true,
                actorUserId: 'root',
                targetUserId: 'shadow'
            })
        ).toBe(true);
    });

    it('blocks permanent delete on cloud', () => {
        expect(
            canPermanentlyDeleteConsoleUser({
                isSelfHosted: false,
                actorUserId: 'root',
                targetUserId: 'shadow'
            })
        ).toBe(false);
    });

    it('blocks deleting yourself', () => {
        expect(
            canPermanentlyDeleteConsoleUser({
                isSelfHosted: true,
                actorUserId: 'root',
                targetUserId: 'root'
            })
        ).toBe(false);
    });

    it('blocks when target user id is missing', () => {
        expect(
            canPermanentlyDeleteConsoleUser({
                isSelfHosted: true,
                actorUserId: 'root',
                targetUserId: null
            })
        ).toBe(false);
    });

    it('blocks when actor user id is missing (fail closed)', () => {
        expect(
            canPermanentlyDeleteConsoleUser({
                isSelfHosted: true,
                actorUserId: undefined,
                targetUserId: 'shadow'
            })
        ).toBe(false);
    });
});

describe('resolveConsoleUserDeletionMode', () => {
    it('returns permanent only when requested and allowed', () => {
        expect(
            resolveConsoleUserDeletionMode({
                permanentlyDeleteRequested: true,
                canPermanentlyDelete: true
            })
        ).toBe('permanent');
    });

    it('falls back to membership_only when not allowed', () => {
        expect(
            resolveConsoleUserDeletionMode({
                permanentlyDeleteRequested: true,
                canPermanentlyDelete: false
            })
        ).toBe('membership_only');
    });

    it('falls back to membership_only when not requested', () => {
        expect(
            resolveConsoleUserDeletionMode({
                permanentlyDeleteRequested: false,
                canPermanentlyDelete: true
            })
        ).toBe('membership_only');
    });
});
