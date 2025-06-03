import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';

const userPreferences = () => get(user)?.prefs;

export function updateSidebarState(state: 'closed' | 'open' | 'icons') {
    if (state === 'open' || state === 'icons') {
        const currentPrefs = userPreferences();

        const newPrefs = {
            ...currentPrefs,
            sidebarState: state
        };

        sdk.forConsole.account.updatePrefs(newPrefs);
    }
}

export function getSidebarState(): 'open' | 'icons' {
    const currentPrefs = userPreferences();
    if (currentPrefs && currentPrefs.sidebarState) {
        if (currentPrefs.sidebarState === 'open' || currentPrefs.sidebarState === 'icons') {
            return currentPrefs.sidebarState;
        }
    }

    return 'open';
}
