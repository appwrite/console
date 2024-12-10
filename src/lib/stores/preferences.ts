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
        get: (route?: Page['route']): Preferences => {
            const $page = get(page);
            const projectId = $page.params.project;
            const routeId = route?.id ?? $page.route.id;

            return (
                preferences[projectId]?.[routeId] ?? {
                    limit: null,
                    view: null,
                    columns: null
                }
            );
        },

        getCustomCollectionColumns: (collectionId: string): Preferences['columns'] => {
            const $page = get(page);
            const projectId = $page.params.project;

            return preferences[projectId]?.collections?.[collectionId] ?? null;
        },
        setLimit: (limit: Preferences['limit']) =>
            update((n) => {
                const $page = get(page);
                const path = $page.route.id;
                const project = $page.params.project;

                if (!n[project]?.[path]) {
                    n[project] ??= {};
                    n[project][path] ??= {};
                }

                n[project][path].limit = limit;

                return n;
            }),
        setView: (view: Preferences['view']) =>
            update((n) => {
                const $page = get(page);
                const path = $page.route.id;
                const project = $page.params.project;
                if (!n[project]?.[path]) {
                    n[project] ??= {};
                    n[project][path] ??= {};
                }

                n[project][path].view = view;

                return n;
            }),
        setColumns: (columns: Preferences['columns']) =>
            update((n) => {
                const $page = get(page);
                const path = $page.route.id;
                const project = $page.params.project;
                if (!n[project]?.[path]) {
                    n[project] ??= {};
                    n[project][path] ??= {};
                }

                n[project][path].columns = columns;

                return n;
            }),
        setCustomCollectionColumns: (columns: Preferences['columns']) =>
            update((n) => {
                const $page = get(page);
                const project = $page.params.project;
                const collection = $page.params.collection;

                if (!n[project]?.collections?.[collection]) {
                    n[project] ??= {};
                    n[project].collections ??= {};
                }

                n[project].collections[collection] = columns;

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
