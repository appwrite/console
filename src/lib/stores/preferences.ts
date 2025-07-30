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
    order?: string[];
    widths?: { [columnId: string]: { fixed: number | { min: number }; resized: number } };
};

type PreferencesStore = {
    [key: string]: Preferences;
    // kept for backwards compatibility
    collections?: {
        [key: string]: Preferences['columns'];
    };
    tables?: {
        [key: string]: Preferences['columns'];
    };
    displayNames?: {
        [key: string]: TeamPreferences['names'];
    };
    columnOrder?: {
        [key: string]: TeamPreferences['order'];
    };
    columnWidths?: {
        [key: string]: TeamPreferences['widths'];
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
    let teamPreferences: PreferencesStore = {};

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

    async function loadTeamPreferences(orgId: string) {
        try {
            const teamPrefs = await sdk.forConsole.teams.getPrefs(orgId);
            teamPreferences = teamPrefs ?? {};
            return teamPreferences;
        } catch (error) {
            teamPreferences = {};
            return teamPreferences;
        }
    }

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
        getCustomTableColumns: (tableId: string): Preferences['columns'] => {
            return preferences?.tables?.[tableId] ?? preferences?.collections?.[tableId] ?? [];
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
        setCustomTableColumns: (tableId: string, columns: Preferences['columns']) =>
            updateAndSync((n) => {
                n ??= {};
                n.tables ??= {};

                n.tables[tableId] = Array.from(new Set(columns));
                // let's not double save
                // n.collections[tableId] = Array.from(new Set(columns));
                return n;
            }),
        loadTeamPrefs: loadTeamPreferences,
        getDisplayNames: () => {
            return preferences?.displayNames ?? {};
        },
        setDisplayNames: async (
            orgId: string,
            tableId: string,
            names: TeamPreferences['names']
        ) => {
            let teamPrefs: Models.Preferences;
            await updateAndSync((n) => {
                if (!n?.displayNames) {
                    n ??= {};
                    n.displayNames ??= {};
                }

                teamPrefs = n;
                n.displayNames[tableId] = names;

                return n;
            });

            await sdk.forConsole.teams.updatePrefs(orgId, teamPrefs);
        },

        getColumnOrder(collectionId: string): TeamPreferences['order'] {
            return teamPreferences?.columnOrder?.[collectionId] ?? [];
        },

        async saveColumnOrder(
            orgId: string,
            collectionId: string,
            columnIds: TeamPreferences['order']
        ) {
            if (!teamPreferences.columnOrder) {
                teamPreferences.columnOrder = {};
            }

            teamPreferences.columnOrder[collectionId] = columnIds;

            await sdk.forConsole.teams.updatePrefs(orgId, teamPreferences);
        },

        getColumnWidths(collectionId: string): TeamPreferences['widths'] {
            return teamPreferences?.columnWidths?.[collectionId] ?? {};
        },

        async saveColumnWidths(
            orgId: string,
            collectionId: string,
            width: TeamPreferences['widths']
        ) {
            if (!teamPreferences.columnWidths) {
                teamPreferences.columnWidths = {};
            }

            teamPreferences.columnWidths[collectionId] = {
                ...teamPreferences.columnWidths[collectionId],
                ...width
            };

            await sdk.forConsole.teams.updatePrefs(orgId, teamPreferences);
        }
    };
}

export const preferences = createPreferences();

export type PreferencesType = ReturnType<typeof createPreferences>;
