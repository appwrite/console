import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@appwrite.io/console';
import { sdk } from './sdk';

export const teamPrefs = cachedStore<
    Models.Preferences,
    {
        load: (id: string) => Promise<void>;
        updatePrefs: (id: string, prefs: Models.Preferences) => Promise<void>;
    }
>('teamPrefs', (store) => ({
    load: async (id: string) => {
        const prefs = await sdk.forConsole.teams.getPrefs(id);
        store.set(prefs);
    },
    updatePrefs: async (id: string, prefs: Models.Preferences) => {
        await sdk.forConsole.teams.updatePrefs(id, prefs);
        store.set(prefs);
    }
}));
