import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createCollectionStore() {
    const { subscribe, set } = writable<Models.CollectionList>(
        browser ? JSON.parse(sessionStorage.getItem('database')) : null
    );
    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            const response = await sdkForProject.databases.listCollections(search, limit, offset);
            set(response);
        }
    };
}

function createDatabase() {
    const { subscribe, set } = writable<Models.Database>();

    return {
        subscribe,
        set,
        load: async () => {
            set(await sdkForProject.databases.get());
        }
    };
}
export const collections = createCollectionStore();
export const database = createDatabase();

if (browser) {
    collections.subscribe((n) => sessionStorage?.setItem('collections', JSON.stringify(n ?? '')));
    database.subscribe((n) => sessionStorage?.setItem('database', JSON.stringify(n ?? '')));
}
