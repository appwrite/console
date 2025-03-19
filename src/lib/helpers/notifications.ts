import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';

export type NotificationPrefItem = {
    expiry: number;
    hideCount: number;
    state: 'hidden' | 'shown' | undefined;
};

export type NotificationCoolOffOptions = {
    coolOffPeriod?: number;
    exponentialBackoff?: boolean;
    exponentialBackoffFactor?: number;
};

const userPreferences = () => get(user)?.prefs;

const notificationPrefs = (): Record<string, NotificationPrefItem> => {
    const prefs = userPreferences();

    // due to php backend, empty object can be returned as an empty array.
    if (!prefs?.notificationPrefs || Array.isArray(prefs.notificationPrefs)) {
        return {};
    }

    return prefs.notificationPrefs;
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
 * @param {NotificationCoolOffOptions} [options] - Configuration for cool-off behavior.
 * @param {number} [options.coolOffPeriod=24] - Cool-off period in hours, defaults to 24 hours.
 * @param {boolean} [options.exponentialBackoff=false] - If true, the cool-off period doubles with each hide. Consider using a smaller `coolOffPeriod` when this option is enabled.
 * @param {number} [options.exponentialBackoffFactor=2] - The factor by which the cool-off period is multiplied with each hide. Default is 2.
 */
export function hideNotification(id: string, options: NotificationCoolOffOptions = {}) {
    const {
        coolOffPeriod = 24,
        exponentialBackoff = false,
        exponentialBackoffFactor = 2
    } = options;

    const parsedBannerPrefs = notificationPrefs();

    let expiryTime = Date.now() + coolOffPeriod * 3600000;

    let hideCount = parsedBannerPrefs[id]?.hideCount || 0;

    if (exponentialBackoff) {
        hideCount += 1;
        expiryTime =
            Date.now() + coolOffPeriod * 3600000 * exponentialBackoffFactor ** (hideCount - 1);
    }

    parsedBannerPrefs[id] = {
        hideCount,
        state: 'hidden',
        expiry: expiryTime
    };

    updateNotificationPrefs(parsedBannerPrefs);
}

/**
 * Removes the notification preference for the given ID from the user's preferences.
 *
 * @param {string} id - The ID of the notification to remove from preferences.
 */
export function removeNotificationFromPrefs(id: string) {
    const parsedBannerPrefs = notificationPrefs();

    if (!parsedBannerPrefs[id]) return;

    delete parsedBannerPrefs[id];

    updateNotificationPrefs(parsedBannerPrefs);
}

/**
 * Checks if the notification banner should be shown based on the expiry time.
 *
 * @param {string} id - The ID of the notification.
 * @returns {boolean} - Returns true if the banner should be shown, false otherwise.
 */
export function shouldShowNotification(id: string): boolean {
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
