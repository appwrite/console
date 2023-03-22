import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { Page } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { sdk } from './sdk';

type Preferences = {
    limit?: number;
    view?: 'table' | 'grid';
};
type PreferencesStore = {
    [key: string]: {
        [key: string]: Preferences;
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
                    view: null
                }
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
            })
    };
}

export const preferences = createPreferences();

if (browser) {
    preferences.subscribe((n) => globalThis.localStorage.setItem('preferences', JSON.stringify(n)));
}
