import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type BucketList = {
    loading: boolean;
    response?: Models.BucketList;
};

function createBucketListStore() {
    const { subscribe, set } = writable<BucketList>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('bucketList')) : null
    });

    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            try {
                const response = await sdkForProject.storage.listBuckets(search, limit, offset);
                set({
                    loading: false,
                    response
                });
            } catch (error) {
                //TODO: take care what happens here
            }
        }
    };
}

export const bucketList = createBucketListStore();

if (browser) {
    bucketList.subscribe((n) =>
        sessionStorage?.setItem('bucketList', JSON.stringify(n.response ?? ''))
    );
}
