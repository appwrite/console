import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createBucketListStore() {
    const { subscribe, set } = writable<Models.BucketList>(
        browser ? JSON.parse(sessionStorage.getItem('bucketList')) : null
    );

    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            const response = await sdkForProject.storage.listBuckets(search, limit, offset);
            set(response);
        },
        count: async (id: string) => {
            let total = {};
            total = browser ? JSON.parse(sessionStorage.getItem('bucketCount')) ?? {} : {};
            const response = await sdkForProject.storage.listFiles(id);
            total[id] = response.total;
            sessionStorage?.setItem('bucketCount', JSON.stringify(total));
            return total;
        }
    };
}

export const bucketList = createBucketListStore();

if (browser) {
    bucketList.subscribe((n) => sessionStorage?.setItem('bucketList', JSON.stringify(n ?? '')));
}
