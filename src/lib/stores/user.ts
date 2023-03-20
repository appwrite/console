import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import { sdk } from './sdk';
import { cachedStore } from '$lib/helpers/cache';

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
        const prefs = await sdk.forConsole.account.getPrefs();
        store.set(prefs);
    },
    updatePrefs: async (prefs: Models.Preferences) => {
        await sdk.forConsole.account.updatePrefs(prefs);
        store.set(prefs);
    }
}));
