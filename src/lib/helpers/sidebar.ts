import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
import type { Page } from '@sveltejs/kit';

const userPreferences = () => get(user)?.prefs;

// for spreadsheet, closed with icons
const isInDatabasesRoute = (page: Page) => {
    return page.route.id?.includes('databases/database-[database]');
};

export function updateSidebarState(page: Page, state: 'closed' | 'open' | 'icons') {
    if (isInDatabasesRoute(page)) return;

    if (state === 'open' || state === 'icons') {
        const currentPrefs = userPreferences();

        const newPrefs = {
            ...currentPrefs,
            sidebarState: state
        };

        sdk.forConsole.account.updatePrefs({ prefs: newPrefs });
    }
}

export function getSidebarState(page: Page): 'open' | 'icons' {
    if (isInDatabasesRoute(page)) return 'icons';

    const currentPrefs = userPreferences();
    if (currentPrefs && currentPrefs.sidebarState) {
        if (currentPrefs.sidebarState === 'open' || currentPrefs.sidebarState === 'icons') {
            return currentPrefs.sidebarState;
        }
    }

    return 'open';
}
