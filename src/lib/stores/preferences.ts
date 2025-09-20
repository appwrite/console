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
    widths?: { [columnId: string]: { fixed: number | { min: number }; resized: number } };
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
        [key: string]: TeamPreferences['widths'];
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

function safePrefsKey(widthPreferences: TeamPreferences['widths'], from: string, to: string) {
    if (widthPreferences?.[from]) {
        widthPreferences[to] = widthPreferences[from];
        delete widthPreferences[from];
    }
}

function safePrefsKeyForOrder(order: TeamPreferences['order'], from: string, to: string) {
    if (order.includes(from)) {
        const index = order.indexOf(from);
        if (index !== -1) {
            order[index] = to;
        }
    }

    // move to first since its primary!
    const toIndex = order.indexOf(to);
    if (toIndex !== -1 && toIndex !== 0) {
        order.splice(toIndex, 1);
        order.unshift(to);
    }
}

// rare cases where the value was an array, probably due to PHP backend.
function ensureObjectProperty<T extends Record<string, unknown>, K extends keyof T>(
    obj: T | null | undefined,
    key: K
): T {
    if (!obj || typeof obj !== 'object') {
        obj = {} as T;
    }
    if (obj[key] == null || typeof obj[key] !== 'object' || Array.isArray(obj[key])) {
        obj[key] = {} as T[K];
    }

    return obj;
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
            return Promise.resolve();
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
                n = ensureObjectProperty(n, path);

                n[path].limit = limit;

                return n;
            }),

        setView: (view: ConsolePreferences['view']) =>
            updateAndSync((n) => {
                const path = page.route.id;
                n = ensureObjectProperty(n, path);

                n[path].view = view;
                return n;
            }),

        setColumns: (columns: ConsolePreferences['columns']) =>
            updateAndSync((n) => {
                const path = page.route.id;
                n = ensureObjectProperty(n, path);

                n[path].columns = columns;
                return n;
            }),

        setCustomTableColumns: (tableId: string, columns: ConsolePreferences['columns']) =>
            updateAndSync((n) => {
                n = ensureObjectProperty(n, 'tables');
                n.tables[tableId] = Array.from(new Set(columns ?? []));
                return n;
            }),

        deleteTableDetails: async (orgId: string, tableId: string) => {
            // remove from account preferences
            const removeCustomTableColumns = updateAndSync((n) => {
                n = ensureObjectProperty(n, 'tables');
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
            const names = teamPreferences?.displayNames?.[tableId];
            return Array.isArray(names) && names.length > 0 ? names : ['$id'];
        },

        setDisplayNames: async (
            orgId: string,
            tableId: string,
            displayNames: TeamPreferences['names']
        ) => {
            teamPreferences = ensureObjectProperty(teamPreferences, 'displayNames');
            teamPreferences.displayNames[tableId] = displayNames;

            await sdk.forConsole.teams.updatePrefs({
                teamId: orgId,
                prefs: teamPreferences
            });
        },

        getColumnOrder(tableId: string): TeamPreferences['order'] {
            const columnOrder = teamPreferences?.columnOrder?.[tableId] ?? [];
            safePrefsKeyForOrder(columnOrder, '$uid', '$id');
            return columnOrder;
        },

        async saveColumnOrder(orgId: string, tableId: string, columnIds: TeamPreferences['order']) {
            teamPreferences = ensureObjectProperty(teamPreferences, 'columnOrder');

            teamPreferences.columnOrder[tableId] = columnIds;

            for (const tableOrder of Object.values(teamPreferences.columnOrder)) {
                safePrefsKeyForOrder(tableOrder, '$id', '$uid');
            }

            await sdk.forConsole.teams.updatePrefs({
                teamId: orgId,
                prefs: teamPreferences
            });
        },

        getColumnWidths(tableId: string): TeamPreferences['widths'] {
            const columnWidths = teamPreferences?.columnWidths?.[tableId] ?? {};
            safePrefsKey(columnWidths, '$uid', '$id');
            return columnWidths;
        },

        async saveColumnWidths(orgId: string, tableId: string, width: TeamPreferences['widths']) {
            teamPreferences = ensureObjectProperty(teamPreferences, 'columnWidths');

            teamPreferences.columnWidths[tableId] = {
                ...teamPreferences.columnWidths[tableId],
                ...width
            };

            // older version could still have the problematic key!
            for (const tableWidths of Object.values(teamPreferences.columnWidths)) {
                safePrefsKey(tableWidths, '$id', '$uid');
            }

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
                n = ensureObjectProperty(n, 'miscellaneous');
                n.miscellaneous[key] = value;
                return n;
            });
        }
    };
}

export const preferences = createPreferences();
