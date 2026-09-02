import { beforeEach, describe, expect, it, vi } from 'vitest';

const updatePrefs = vi.fn();

vi.mock('$lib/stores/sdk', () => ({
    sdk: { forConsole: { account: { updatePrefs: (...args: unknown[]) => updatePrefs(...args) } } }
}));

vi.mock('$lib/stores/user', () => ({
    user: { subscribe: (run: (value: unknown) => void) => (run({ prefs: {} }), () => {}) }
}));

import { hideNotification } from './notifications';

describe('hideNotification', () => {
    beforeEach(() => {
        updatePrefs.mockReset();
    });

    it('returns the preference write so callers can await it', async () => {
        updatePrefs.mockResolvedValue({});

        await expect(hideNotification('promo')).resolves.toBeDefined();
        expect(updatePrefs).toHaveBeenCalledOnce();
    });

    // Without a returned promise a rejected write is unobservable, and a dismissal is silently
    // lost on the next load. Callers need to be able to fall back.
    it('surfaces a rejected write instead of swallowing it', async () => {
        updatePrefs.mockRejectedValue(new Error('network'));

        await expect(hideNotification('promo')).rejects.toThrow('network');
    });

    it('records the snooze that was asked for', async () => {
        updatePrefs.mockResolvedValue({});

        const before = Date.now();
        await hideNotification('promo', { coolOffPeriod: 24 * 7 });

        const written = updatePrefs.mock.calls[0][0].prefs.notificationPrefs['promo'];
        expect(written.state).toBe('hidden');
        expect(written.expiry).toBeGreaterThanOrEqual(before + 24 * 7 * 3600000);
    });

    it('doubles the cool-off on each dismissal when backoff is on', async () => {
        updatePrefs.mockResolvedValue({});

        const before = Date.now();
        await hideNotification('promo', { coolOffPeriod: 24, exponentialBackoff: true });

        const written = updatePrefs.mock.calls[0][0].prefs.notificationPrefs['promo'];
        expect(written.hideCount).toBe(1);
        expect(written.expiry).toBeGreaterThanOrEqual(before + 24 * 3600000);
    });
});
