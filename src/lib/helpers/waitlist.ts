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
};

export const isOnWaitlistSites = (): boolean => {
    const prefs = userPreferences();
    console.log('prefs', prefs);
    return 'joinWaitlistSites' in prefs;
};
