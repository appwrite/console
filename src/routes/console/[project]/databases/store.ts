import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createDatabaseListStore() {
    const { subscribe, set } = writable<Models.DatabaseList>(
        browser ? JSON.parse(sessionStorage.getItem('databaseList')) : null
    );

    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            const response = await sdkForProject.databases.list(search, limit, offset);
            set(response);
        },
        total: async (id: string) => {
            let total = {};
            total = browser ? JSON.parse(sessionStorage.getItem('databaseTotal')) ?? {} : {};
            const response = await sdkForProject.databases.listCollections(id);
            total[id] = response.total;
            sessionStorage?.setItem('databaseTotal', JSON.stringify(total));
            return total;
        }
    };
}

export const databaseList = createDatabaseListStore();

if (browser) {
    databaseList.subscribe((n) => sessionStorage?.setItem('databaseList', JSON.stringify(n ?? '')));
}
