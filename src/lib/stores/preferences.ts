import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { View } from '$lib/helpers/load';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';
import type { Models } from '@appwrite.io/console';
import { organization } from './organization';
import { user } from '$lib/stores/user';

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

async function updateConsolePreferences(store: PreferencesStore): Promise<void> {
    const currentPreferences = get(user).prefs ?? (await sdk.forConsole.account.getPrefs());
    if (!currentPreferences?.console || Array.isArray(currentPreferences.console)) {
        currentPreferences.console = {};
    }

    currentPreferences.console = {
        ...currentPreferences.console,
        ...store
    };

    await sdk.forConsole.account.updatePrefs(currentPreferences);
}

function createPreferences() {
    const { subscribe, set, update } = writable<PreferencesStore>({});
    let preferences: PreferencesStore = {};

    if (browser) {
        // fresh fetch.
        sdk.forConsole.account
            .getPrefs()
            .then((userPreferences) => {
                if (!userPreferences?.console || Array.isArray(userPreferences.console)) {
                    userPreferences.console = {};
                }

                set(userPreferences.console);
            })
            .catch(() => {
                // exception is thrown if there's no session; in that case - fallback!
                set(JSON.parse(globalThis.localStorage.getItem('preferences') ?? '{}'));
            });
    }

    subscribe((v) => {
        preferences = v;
        if (browser) {
            globalThis.localStorage.setItem('preferences', JSON.stringify(v));
        }
    });

    /**
     * Update the local store and then synchronizes them on user prefs.
     */
    function updateAndSync(callback: (prefs: PreferencesStore) => void) {
        let oldPrefsSnapshot: string;
        let newPrefsSnapshot: PreferencesStore;

        update((currentPrefs) => {
            oldPrefsSnapshot = JSON.stringify(currentPrefs);
            callback(currentPrefs);
            newPrefsSnapshot = currentPrefs;
            return currentPrefs;
        });

        // Skip API if no changes (sufficient for simple objects).
        // The key order seemed to be maintained during local tests.
        if (oldPrefsSnapshot === JSON.stringify(newPrefsSnapshot)) {
            return;
        }

        // sync the preferences.
        updateConsolePreferences(newPrefsSnapshot).then();
    }

    return {
        subscribe,
        set,
        update,
        get: (route?: Page['route']): Preferences => {
            const parsedRoute = route ?? get(page).route;
            return (
                preferences[sdk.forProject.client.config.project]?.[parsedRoute.id] ?? {
                    limit: null,
                    view: null,
                    columns: null
                }
            );
        },

        getCustomCollectionColumns: (collectionId: string): Preferences['columns'] => {
            return (
                preferences[sdk.forProject.client.config.project]?.collections?.[collectionId] ?? []
            );
        },
        setLimit: (limit: Preferences['limit']) =>
            updateAndSync((n) => {
                const path = get(page).route.id;
                const project = sdk.forProject.client.config.project;
                if (!n[project]?.[path]) {
                    n[project] ??= {};
                    n[project][path] ??= {};
                }

                n[project][path].limit = limit;

                return n;
            }),
        setView: (view: Preferences['view']) =>
            updateAndSync((n) => {
                const path = get(page).route.id;
                const project = sdk.forProject.client.config.project;
                if (!n[project]?.[path]) {
                    n[project] ??= {};
                    n[project][path] ??= {};
                }

                n[project][path].view = view;

                return n;
            }),
        setColumns: (columns: Preferences['columns']) =>
            updateAndSync((n) => {
                const path = get(page).route.id;
                const project = sdk.forProject.client.config.project;
                if (!n[project]?.[path]) {
                    n[project] ??= {};
                    n[project][path] ??= {};
                }

                n[project][path].columns = columns;

                return n;
            }),
        setCustomCollectionColumns: (columns: Preferences['columns']) =>
            updateAndSync((n) => {
                const current = get(page);
                const project = sdk.forProject.client.config.project;
                const collection = current.params.collection;
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
