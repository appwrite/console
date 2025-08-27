import { browser } from '$app/environment';
import type { View } from '$lib/helpers/load';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';
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
    order?: string[];
    /* old `widths` got corrupted */
    widths_v2?: { [columnId: string]: { fixed: number | { min: number }; resized: number } };
};

type ConsolePreferencesStore = {
    [key: string]: ConsolePreferences;
    // kept for backwards compatibility
    collections?: {
        [key: string]: ConsolePreferences['columns'];
    };
    tables?: {
        [key: string]: ConsolePreferences['columns'];
    };
    displayNames?: {
        [key: string]: TeamPreferences['names'];
    };
    columnOrder?: {
        [key: string]: TeamPreferences['order'];
    };
    columnWidths?: {
        [key: string]: TeamPreferences['widths_v2'];
    };
    miscellaneous?: {
        [key: string]: string | number | boolean;
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

    await sdk.forConsole.account.updatePrefs({ prefs: currentPreferences });
}

function createPreferences() {
    const { subscribe, set, update } = writable<ConsolePreferencesStore>({});
    let preferences: ConsolePreferencesStore = {};
    let teamPreferences: ConsolePreferencesStore = {};

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
            const teamPrefs = await sdk.forConsole.teams.getPrefs({ teamId: orgId });
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
        getForRoute: (route?: Page['route']): ConsolePreferences => {
            const parsedRoute = route ?? page.route;
            return (
                preferences?.[parsedRoute.id] ?? {
                    limit: null,
                    view: null,
                    columns: null
                }
            );
        },

        getCustomTableColumns: (tableId: string): ConsolePreferences['columns'] => {
            return preferences?.tables?.[tableId] ?? preferences?.collections?.[tableId] ?? [];
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

        setCustomTableColumns: (tableId: string, columns: ConsolePreferences['columns']) =>
            updateAndSync((n) => {
                n ??= {};
                n.tables ??= {};

                n.tables[tableId] = Array.from(new Set(columns));
                return n;
            }),

        deleteTableDetails: async (orgId: string, tableId: string) => {
            // remove from account preferences
            const removeCustomTableColumns = updateAndSync((n) => {
                if (!n?.tables) {
                    n ??= {};
                    n.tables ??= {};
                }

                delete n.tables[tableId];
                return n;
            });

            delete teamPreferences?.displayNames?.[tableId];
            delete teamPreferences?.columnOrder?.[tableId];
            delete teamPreferences?.columnWidths?.[tableId];

            const removeTablePreferences = sdk.forConsole.teams.updatePrefs({
                teamId: orgId,
                prefs: teamPreferences
            });

            await Promise.all([removeCustomTableColumns, removeTablePreferences]);
        },

        loadTeamPrefs: loadTeamPreferences,

        getDisplayNames: (tableId: string) => {
            return teamPreferences?.displayNames?.[tableId] ?? ['$id'];
        },

        setDisplayNames: async (
            orgId: string,
            tableId: string,
            displayNames: TeamPreferences['names']
        ) => {
            if (!teamPreferences.displayNames) {
                teamPreferences.displayNames = {};
            }

            teamPreferences.displayNames[tableId] = displayNames;

            await sdk.forConsole.teams.updatePrefs({
                teamId: orgId,
                prefs: teamPreferences
            });
        },

        getColumnOrder(tableId: string): TeamPreferences['order'] {
            return teamPreferences?.columnOrder?.[tableId] ?? [];
        },

        async saveColumnOrder(orgId: string, tableId: string, columnIds: TeamPreferences['order']) {
            if (!teamPreferences.columnOrder) {
                teamPreferences.columnOrder = {};
            }

            teamPreferences.columnOrder[tableId] = columnIds;

            await sdk.forConsole.teams.updatePrefs({
                teamId: orgId,
                prefs: teamPreferences
            });
        },

        getColumnWidths(tableId: string): TeamPreferences['widths_v2'] {
            const columnWidths = teamPreferences?.columnWidths?.[tableId] ?? {};

            if (columnWidths['$uid']) {
                columnWidths['$id'] = columnWidths['$uid'];
                delete columnWidths['$uid'];
            }

            return columnWidths;
        },

        async saveColumnWidths(
            orgId: string,
            tableId: string,
            width: TeamPreferences['widths_v2']
        ) {
            if (!teamPreferences.columnWidths) {
                teamPreferences.columnWidths = {};
            }

            if (width['$id']) {
                width['$uid'] = width['$id'];
                delete width['$id'];
            }

            teamPreferences.columnWidths[tableId] = {
                ...teamPreferences.columnWidths[tableId],
                ...width
            };

            await sdk.forConsole.teams.updatePrefs({
                teamId: orgId,
                prefs: teamPreferences
            });
        },

        getKey<T>(key: string, _default: T): T {
            return (preferences?.miscellaneous?.[key] ?? _default) as T;
        },

        async setKey(key: string, value: string | number | boolean) {
            await updateAndSync((n) => {
                if (!n?.miscellaneous) {
                    n ??= {};
                    n.miscellaneous ??= {};
                }

                n.miscellaneous[key] = value;
                return n;
            });
        }
    };
}

export const preferences = createPreferences();
