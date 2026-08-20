import { describe, expect, it } from 'vitest';
import { resolveOAuth2AppLogoUrl } from './oauth2-app-logo';

describe('resolveOAuth2AppLogoUrl', () => {
    it('uses the square Appwrite icon for the first-party CLI client', () => {
        expect(
            resolveOAuth2AppLogoUrl({
                $id: 'appwrite-cli',
                logoUri: 'https://example.com/wordmark.svg'
            })
        ).toBe('/console/logos/appwrite-icon.svg');
    });

    it('keeps third-party logoUri values', () => {
        expect(
            resolveOAuth2AppLogoUrl({
                $id: 'other-app',
                logoUri: 'https://example.com/logo.png'
            })
        ).toBe('https://example.com/logo.png');
    });

    it('returns an empty string when no logo is available', () => {
        expect(resolveOAuth2AppLogoUrl({ $id: 'other-app', logoUri: '  ' })).toBe('');
        expect(resolveOAuth2AppLogoUrl(null)).toBe('');
    });
});
