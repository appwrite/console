import { browser } from '$app/environment';
import type { View } from '$lib/helpers/load';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';
import type { Models } from '@appwrite.io/console';
import { page } from '$app/state';
import { user } from '$lib/stores/user';
import deepEqual from 'deep-equal';

type Preferences = {
    limit?: number;
    view?: View;
    columns?: string[];
};

type TeamPreferences = {
    names?: string[];
    displayNames?: {
        [key: string]: string[];
    };
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

async function updateConsolePreferences(store: PreferencesStore): Promise<void> {
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
    function updateAndSync(callback: (prefs: PreferencesStore) => void): Promise<void> {
        let oldPrefsSnapshot: PreferencesStore;
        let newPrefsSnapshot: PreferencesStore;

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
        get: (route?: Page['route']): Preferences => {
            const parsedRoute = route ?? page.route;
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
            updateAndSync((n) => {
                const path = page.route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].limit = limit;

                return n;
            }),
        setView: (view: Preferences['view']) =>
            updateAndSync((n) => {
                const path = page.route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].view = view;

                return n;
            }),
        setColumns: (columns: Preferences['columns']) =>
            updateAndSync((n) => {
                const path = page.route.id;

                if (!n?.[path]) {
                    n ??= {};
                    n[path] ??= {};
                }

                n[path].columns = columns;

                return n;
            }),
        setCustomCollectionColumns: (collectionId: string, columns: Preferences['columns']) =>
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
                n[id] = teamPrefs;
                // Merge team display names with local preferences
                if (teamPrefs?.displayNames) {
                    if (!n.displayNames) {
                        n.displayNames = {};
                    }
                    n.displayNames = { ...n.displayNames, ...teamPrefs.displayNames };
                }
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
            // Update local preferences to track display names
            update((n) => {
                if (!n?.displayNames) {
                    n ??= {};
                    n.displayNames ??= {};
                }

                n.displayNames[collectionId] = names;
                return n;
            });

            // Get existing team preferences or create new one
            let teamPrefs: Models.Preferences;
            try {
                teamPrefs = await sdk.forConsole.teams.getPrefs(orgId);
            } catch (error) {
                // If no team preferences exist yet, create empty object
                teamPrefs = {};
            }

            // Update only the display names in team preferences
            if (!teamPrefs.displayNames) {
                teamPrefs.displayNames = {};
            }
            teamPrefs.displayNames[collectionId] = names;

            // Send only team preferences to the team API
            await sdk.forConsole.teams.updatePrefs(orgId, teamPrefs);
        }
    };
}

export const preferences = createPreferences();
