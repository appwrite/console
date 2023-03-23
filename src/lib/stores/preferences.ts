import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { View } from '$lib/helpers/load';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';

type Preferences = {
    limit?: number;
    view?: View;
    columns?: string[];
};

type PreferencesStore = {
    [key: string]: {
        [key: string]: Preferences;
        collections?: {
            [key: string]: Preferences['columns'];
        };
    };
};

function createPreferences() {
    const { subscribe, set, update } = writable<PreferencesStore>({});
    if (browser) {
        set(JSON.parse(globalThis.localStorage.getItem('preferences') ?? '{}'));
    }
    return {
        subscribe,
        get: (route: Page['route']): Preferences => {
            let preferences: PreferencesStore;
            subscribe((n) => (preferences = n))();

            return (
                preferences[sdk.forProject.client.config.project]?.[route.id] ?? {
                    limit: null,
                    view: null,
                    columns: null
                }
            );
        },
        getCustomCollectionColumns: (collectionId: string): Preferences['columns'] => {
            let preferences: PreferencesStore;
            subscribe((n) => (preferences = n))();

            return (
                preferences[sdk.forProject.client.config.project]?.collections?.[collectionId] ??
                null
            );
        },
        setLimit: (limit: Preferences['limit']) =>
            update((n) => {
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
            update((n) => {
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
            update((n) => {
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
            update((n) => {
                const current = get(page);
                const project = sdk.forProject.client.config.project;
                const collection = current.params.collection;
                if (!n[project]?.collections?.[collection]) {
                    n[project] ??= {};
                    n[project].collections ??= {};
                }

                n[project].collections[collection] = columns;

                return n;
            })
    };
}

export const preferences = createPreferences();

if (browser) {
    preferences.subscribe((n) => globalThis.localStorage.setItem('preferences', JSON.stringify(n)));
}
