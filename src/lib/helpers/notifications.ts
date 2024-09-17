import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';

type NotificationPrefItem = {
    expiry: number;
    hideCount: number;
    state: 'hidden' | 'shown' | undefined;
};

const userPreferences = () => get(user).prefs;

const notificationPrefs = (): Record<string, NotificationPrefItem> => {
    const prefs = userPreferences();
    return prefs.notificationPrefs ? JSON.parse(prefs.notificationPrefs) : {};
};

function updateNotificationPrefs(parsedPrefs: Record<string, NotificationPrefItem>) {
    const currentPrefs = userPreferences();

    const newPrefs = {
        ...currentPrefs,
        notificationPrefs: parsedPrefs
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
}

/**
 * Hides the notification banner by marking it as 'hidden' and setting an expiry time.
 * Supports normal cool-off periods or exponential backoff based on the options passed.
 *
 * @param {string} id - The ID of the notification.
 * @param {number} [coolOffPeriod=24] - Cool-off period in hours, defaults to 24 hours.
 * @param {boolean} [exponentialBackoff=false] - If true, the cool-off period doubles with each hide. Consider using a smaller `coolOffPeriod` when this option is enabled.
 */
export function hideNotificationBanner(
    id: string,
    coolOffPeriod: number = 24,
    exponentialBackoff: boolean = false
) {
    const parsedBannerPrefs = notificationPrefs();

    let expiryTime = Date.now() + coolOffPeriod * 3600000;

    let hideCount = parsedBannerPrefs[id]?.hideCount || 0;

    if (exponentialBackoff) {
        hideCount += 1;
        expiryTime = Date.now() + coolOffPeriod * 3600000 * 2 ** (hideCount - 1);
    }

    parsedBannerPrefs[id] = {
        hideCount,
        state: 'hidden',
        expiry: expiryTime
    };

    updateNotificationPrefs(parsedBannerPrefs);
}

/**
 * Checks if the notification banner should be shown based on the expiry time.
 *
 * @param {string} id - The ID of the notification.
 * @returns {boolean} - Returns true if the banner should be shown, false otherwise.
 */
export function shouldShowNotificationBanner(id: string): boolean {
    const parsedBannerPrefs = notificationPrefs();

    const notificationPref = parsedBannerPrefs[id];

    if (!notificationPref) return true;

    if (Date.now() >= notificationPref.expiry) {
        notificationPref.state = 'shown';
        updateNotificationPrefs(parsedBannerPrefs);
        return true;
    }

    return false;
}
