import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';

const userPreferences = () => get(user)?.prefs;

export const joinWaitlistSites = () => {
    const currentPrefs = userPreferences();

    const newPrefs = {
        ...currentPrefs,
        joinWaitlistSites: true
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
};

export const isOnWaitlistSites = (): boolean => {
    const currentPrefs = userPreferences();

    return 'joinWaitlistSites' in currentPrefs;
};
