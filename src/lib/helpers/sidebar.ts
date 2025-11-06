import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';

const userPreferences = () => get(user)?.prefs;

// for spreadsheet, closed with icons
export const isInDatabasesRoute = (route: { id?: string }) => {
    return route.id?.includes('databases/database-[database]');
};

export function updateSidebarState(state: 'closed' | 'open' | 'icons') {
    if (state === 'open' || state === 'icons') {
        const currentPrefs = userPreferences();

        const newPrefs = {
            ...currentPrefs,
            sidebarState: state
        };

        sdk.forConsole.account.updatePrefs({ prefs: newPrefs });
    }
}

export function getSidebarState(): 'open' | 'icons' {
    if (resolvedProfile.id === ProfileMode.STUDIO) return 'icons';

    const currentPrefs = userPreferences();
    if (currentPrefs && currentPrefs.sidebarState) {
        if (currentPrefs.sidebarState === 'open' || currentPrefs.sidebarState === 'icons') {
            return currentPrefs.sidebarState;
        }
    }

    return 'open';
}
