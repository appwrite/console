import { getVcsInstallationErrorKind } from '$lib/helpers/vcsError';
import { describe, expect, it } from 'vitest';

describe('getVcsInstallationErrorKind', () => {
    it('returns null for values that are not error-like objects', () => {
        expect(getVcsInstallationErrorKind(null)).toBe(null);
        expect(getVcsInstallationErrorKind(undefined)).toBe(null);
        expect(getVcsInstallationErrorKind('general_provider_failure')).toBe(null);
        expect(getVcsInstallationErrorKind(400)).toBe(null);
    });

    it('returns null for unrelated error types', () => {
        expect(getVcsInstallationErrorKind({ type: 'general_unknown', message: 'reconnect' })).toBe(
            null
        );
        expect(getVcsInstallationErrorKind({ message: 'Please reconnect the installation.' })).toBe(
            null
        );
    });

    it('classifies a held refresh lock as locked', () => {
        expect(getVcsInstallationErrorKind({ type: 'general_resource_locked' })).toBe('locked');
        expect(
            getVcsInstallationErrorKind({
                type: 'general_resource_locked',
                message: 'The resource is currently locked.',
                status: 409
            })
        ).toBe('locked');
    });

    it('classifies a dead installation token as reconnect', () => {
        expect(
            getVcsInstallationErrorKind({
                type: 'general_provider_failure',
                message: 'This installation has no refresh token on file. Please reconnect it.',
                status: 400
            })
        ).toBe('reconnect');

        expect(
            getVcsInstallationErrorKind({
                type: 'general_provider_failure',
                message: 'Failed to refresh OAuth2 access token. Please reconnect the installation.'
            })
        ).toBe('reconnect');
    });

    it('matches the reconnect hint regardless of case', () => {
        expect(
            getVcsInstallationErrorKind({
                type: 'general_provider_failure',
                message: 'Please RECONNECT the installation.'
            })
        ).toBe('reconnect');
    });

    it('classifies any other provider failure as provider', () => {
        expect(
            getVcsInstallationErrorKind({
                type: 'general_provider_failure',
                message: 'GitHub API rate limit exceeded.'
            })
        ).toBe('provider');
    });

    it('falls back to provider when the failure carries no usable message', () => {
        expect(getVcsInstallationErrorKind({ type: 'general_provider_failure' })).toBe('provider');
        expect(
            getVcsInstallationErrorKind({ type: 'general_provider_failure', message: undefined })
        ).toBe('provider');
    });
});
