import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';

export const joinWaitlistSites = () => {
    const currentPrefs = () => get(user)?.prefs;

    const newPrefs = {
        ...currentPrefs,
        joinWaitlistSites: true
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
};

export const isOnWaitlistSites = (): boolean => {
    const currentPrefs = () => get(user)?.prefs;

    console.log('load from prefs', 'joinWaitlistSites' in currentPrefs);
    return 'joinWaitlistSites' in currentPrefs;
};
