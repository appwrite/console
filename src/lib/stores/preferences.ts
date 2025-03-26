import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { View } from '$lib/helpers/load';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';
import type { Models } from '@appwrite.io/console';
import { organization } from './organization';

type Preferences = {
    limit?: number;
    view?: View;
    columns?: string[];
};

type TeamPreferences = {
    names?: string[];
};

type PreferencesStore = {
    [key: string]: Preferences;
    collections?: {
        [key: string]: Preferences['columns'];
    };
    displayNames?: {
        [key: string]: TeamPreferences['names'];
    };
} & { hideAiDisclaimer?: boolean };

function createPreferences() {
    const { subscribe, set, update } = writable<PreferencesStore>({});
    let preferences: PreferencesStore = {};

    if (browser) {
        set(JSON.parse(globalThis.localStorage.getItem('preferences') ?? '{}'));
    }

    subscribe((v) => {
        preferences = v;
        if (browser) {
            globalThis.localStorage.setItem('preferences', JSON.stringify(v));
        }
    });

    return {
        subscribe,
        set,
        update,
        get: (route?: Page['route']): Preferences => {
            const parsedRoute = route ?? get(page).route;
            return (
                preferences?.[parsedRoute.id] ?? {
                    limit: null,
                    view: null,
                    columns: null
                }
            );
        },

        getCustomCollectionColumns: (collectionId: string): Preferences['columns'] => {
            return preferences?.collections?.[collectionId] ?? [];
        },
        setLimit: (limit: Preferences['limit']) =>
            update((n) => {
                const path = get(page).route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].limit = limit;

                return n;
            }),
        setView: (view: Preferences['view']) =>
            update((n) => {
                const path = get(page).route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].view = view;

                return n;
            }),
        setColumns: (columns: Preferences['columns']) =>
            update((n) => {
                const path = get(page).route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].columns = columns;

                return n;
            }),
        setCustomCollectionColumns: (columns: Preferences['columns']) =>
            update((n) => {
                const current = get(page);

                const collection = current.params.collection;
                if (!n?.collections?.[collection]) {
                    n ??= {};
                    n.collections ??= {};
                }

                n.collections[collection] = columns;

                return n;
            }),
        loadTeamPrefs: async (id: string) => {
            const teamPrefs = await sdk.forConsole.teams.getPrefs(id);
            update((n) => {
                n[id] = teamPrefs;
                return n;
            });

            return teamPrefs;
        },
        getDisplayNames: () => {
            return preferences?.displayNames ?? {};
        },
        setDisplayNames: async (collectionId: string, names: TeamPreferences['names']) => {
            const id = get(organization).$id;
            let teamPrefs: Models.Preferences;
            update((n) => {
                if (!n?.displayNames) {
                    n ??= {};
                    n.displayNames ??= {};
                }

                teamPrefs = n;
                n.displayNames[collectionId] = names;

                return n;
            });
            await sdk.forConsole.teams.updatePrefs(id, teamPrefs);
        }
    };
}

export const preferences = createPreferences();
