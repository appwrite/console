import { describe, it, expect } from 'vitest';
import { oAuthProviders } from './oauth-providers';

describe('oAuthProviders', () => {
    it('should include TikTok provider', () => {
        expect(oAuthProviders.tiktok).toBeDefined();
        expect(oAuthProviders.tiktok.name).toBe('TikTok');
        expect(oAuthProviders.tiktok.icon).toBe('tiktok');
        expect(oAuthProviders.tiktok.docs).toBe('https://developers.tiktok.com/doc/login-kit-web');
        expect(oAuthProviders.tiktok.component).toBeDefined();
    });

    it('should have all providers with required fields', () => {
        Object.entries(oAuthProviders).forEach(([key, provider]) => {
            expect(provider.name).toBeDefined();
            expect(provider.icon).toBeDefined();
            expect(provider.component).toBeDefined();
            // docs is optional but should be a string if defined
            if (provider.docs) {
                expect(typeof provider.docs).toBe('string');
            }
        });
    });

    it('should have TikTok positioned alphabetically after tradeshiftBox and before twitch', () => {
        const keys = Object.keys(oAuthProviders);
        const tiktokIndex = keys.indexOf('tiktok');
        const tradeshiftBoxIndex = keys.indexOf('tradeshiftBox');
        const twitchIndex = keys.indexOf('twitch');

        expect(tiktokIndex).toBeGreaterThan(tradeshiftBoxIndex);
        expect(tiktokIndex).toBeLessThan(twitchIndex);
    });
});
