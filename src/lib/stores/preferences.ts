import { browser } from '$app/environment';
import type { View } from '$lib/helpers/load';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';
import type { Models } from '@appwrite.io/console';
import { page } from '$app/state';
import { user } from '$lib/stores/user';
import deepEqual from 'deep-equal';

type ConsolePreferences = {
    limit?: number;
    view?: View;
    columns?: string[];
} /* support a strict + flexible preference type for TS compatibility */ & Record<
    string,
    string | number | boolean | object | null | unknown
>;

type TeamPreferences = {
    names?: string[];
};

type ConsolePreferencesStore = {
    [key: string]: ConsolePreferences;
    collections?: {
        [key: string]: ConsolePreferences['columns'];
    };
    displayNames?: {
        [key: string]: TeamPreferences['names'];
    };
} & { hideAiDisclaimer?: boolean };

async function updateConsolePreferences(store: ConsolePreferencesStore): Promise<void> {
    const currentPreferences = get(user)?.prefs ?? (await sdk.forConsole.account.getPrefs());
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
    const { subscribe, set, update } = writable<ConsolePreferencesStore>({});
    let preferences: ConsolePreferencesStore = {};

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
    function updateAndSync(callback: (prefs: ConsolePreferencesStore) => void): Promise<void> {
        let oldPrefsSnapshot: ConsolePreferencesStore;
        let newPrefsSnapshot: ConsolePreferencesStore;

        update((currentPrefs) => {
            oldPrefsSnapshot = structuredClone(currentPrefs);
            callback(currentPrefs);
            newPrefsSnapshot = structuredClone(currentPrefs);
            return currentPrefs;
        });

        if (deepEqual(oldPrefsSnapshot, newPrefsSnapshot)) {
            return;
        }

        // sync the preferences.
        return updateConsolePreferences(newPrefsSnapshot);
    }

    return {
        subscribe,
        set,
        update,
        get: (route?: Page['route']): ConsolePreferences => {
            const parsedRoute = route ?? page.route;
            return (
                preferences?.[parsedRoute.id] ?? {
                    limit: null,
                    view: null,
                    columns: null
                }
            );
        },
        getCustomCollectionColumns: (collectionId: string): ConsolePreferences['columns'] => {
            return preferences?.collections?.[collectionId] ?? [];
        },
        setLimit: (limit: ConsolePreferences['limit']) =>
            updateAndSync((n) => {
                const path = page.route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].limit = limit;

                return n;
            }),
        setView: (view: ConsolePreferences['view']) =>
            updateAndSync((n) => {
                const path = page.route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].view = view;

                return n;
            }),
        setColumns: (columns: ConsolePreferences['columns']) =>
            updateAndSync((n) => {
                const path = page.route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].columns = columns;

                return n;
            }),
        setCustomCollectionColumns: (
            collectionId: string,
            columns: ConsolePreferences['columns']
        ) =>
            updateAndSync((n) => {
                if (!n?.collections?.[collectionId]) {
                    n ??= {};
                    n.collections ??= {};
                }

                n.collections[collectionId] = Array.from(new Set(columns));
                return n;
            }),
        loadTeamPrefs: async (id: string) => {
            const teamPrefs = await sdk.forConsole.teams.getPrefs(id);
            update((n) => {
                n[id] = teamPrefs as Preferences;
                return n;
            });

            return teamPrefs;
        },
        getDisplayNames: () => {
            return preferences?.displayNames ?? {};
        },
        setDisplayNames: async (
            orgId: string,
            collectionId: string,
            names: TeamPreferences['names']
        ) => {
            let teamPrefs: Models.Preferences;
            await updateAndSync((n) => {
                if (!n?.displayNames) {
                    n ??= {};
                    n.displayNames ??= {};
                }

                teamPrefs = n;
                n.displayNames[collectionId] = names;

                return n;
            });

            await sdk.forConsole.teams.updatePrefs(orgId, teamPrefs);
        }
    };
}

export const preferences = createPreferences();
