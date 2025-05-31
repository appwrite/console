import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
const userPreferences = () => get(user)?.prefs;

export const joinWaitlistSites = () => {
    const prefs = userPreferences();
    const newPrefs = {
        ...prefs,
        joinWaitlistSites: true
    };

    sdk.forConsole.account.updatePrefs(newPrefs);

    if (sessionStorage) {
        sessionStorage.setItem('joinWaitlistSites', 'true');
    }
};

export const isOnWaitlistSites = (): boolean => {
    const prefs = userPreferences();
    const joinedInPrefs = 'joinWaitlistSites' in prefs;

    let joinedInSession = false;
    if (sessionStorage) {
        joinedInSession = sessionStorage.getItem('joinWaitlistSites') === 'true';
    }

    return joinedInSession || joinedInPrefs;
};
