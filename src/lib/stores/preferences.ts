import { browser } from '$app/environment';
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
    [key: string]: {
        [key: string]: Preferences;
        collections?: {
            [key: string]: Preferences['columns'];
        };
        displayNames?: {
            [key: string]: TeamPreferences['names'];
        };
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
        get: (projectId: string, route: Page['route']): Preferences =>
            preferences[projectId]?.[route.id] ?? {
                limit: null,
                view: null,
                columns: null
            },

        getCustomCollectionColumns: (
            projectId: string,
            collectionId: string
        ): Preferences['columns'] => preferences[projectId]?.collections?.[collectionId] ?? [],
        setLimit: (projectId: string, route: Page['route'], limit: Preferences['limit']) =>
            update((n) => {
                if (!n[projectId]?.[route.id]) {
                    n[projectId] ??= {};
                    n[projectId][route.id] ??= {};
                }

                n[projectId][route.id].limit = limit;

                return n;
            }),
        setView: (projectId: string, route: Page['route'], view: Preferences['view']) =>
            update((n) => {
                if (!n[projectId]?.[route.id]) {
                    n[projectId] ??= {};
                    n[projectId][route.id] ??= {};
                }

                n[projectId][route.id].view = view;

                return n;
            }),
        setColumns: (projectId: string, route: Page['route'], columns: Preferences['columns']) =>
            update((n) => {
                if (!n[projectId]?.[route.id]) {
                    n[projectId] ??= {};
                    n[projectId][route.id] ??= {};
                }

                n[projectId][route.id].columns = columns;

                return n;
            }),
        setCustomCollectionColumns: (
            projectId: string,
            route: Page['route'],
            columns: Preferences['columns']
        ) =>
            update((n) => {
                if (!n[projectId]?.collections?.[route.id]) {
                    n[projectId] ??= {};
                    n[projectId].collections ??= {};
                }

                n[projectId].collections[route.id] = columns;

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
            const id = get(organization)?.$id;
            if (!id) return {};

            return preferences?.[id]?.displayNames ?? {};
        },
        setDisplayNames: async (collectionId: string, names: TeamPreferences['names']) => {
            const id = get(organization).$id;
            let teamPrefs: Models.Preferences;
            update((n) => {
                if (!n[id]?.displayNames) {
                    n[id] ??= {};
                    n[id].displayNames ??= {};
                }

                teamPrefs = n[id];
                n[id].displayNames[collectionId] = names;

                return n;
            });
            await sdk.forConsole.teams.updatePrefs(id, teamPrefs);
        }
    };
}

export const preferences = createPreferences();
