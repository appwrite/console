import { page } from '$app/stores';
import { derived, get } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import { sdkForConsole } from './sdk';
import { cachedStore } from '$lib/helpers/cache';
import { browser } from '$app/environment';

export const user = derived(
    page,
    ($page) => $page.data.account as Models.Account<Record<string, string>>
);

export const prefs = cachedStore<
    Models.Preferences,
    {
        load: () => Promise<void>;
        updatePrefs: (prefs: Models.Preferences) => Promise<void>;
    }
>('prefs', (store) => ({
    load: async () => {
        const prefs = await sdkForConsole.account.getPrefs();
        store.set(prefs);
    },
    updatePrefs: async (prefs: Models.Preferences) => {
        await sdkForConsole.account.updatePrefs(prefs);
        store.set(prefs);
    }
}));

if (browser) {
    if (!get(prefs)) {
        await prefs.load();
        if (!get(prefs)?.preferredView) {
            prefs.updatePrefs({
                preferredView: 'grid',
                pageLimit: 6
            });
        }
    }
}
