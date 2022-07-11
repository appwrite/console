import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createBucketStore() {
    const { subscribe, set } = writable<Models.Bucket>(
        browser ? JSON.parse(sessionStorage.getItem('bucket')) : null
    );

    return {
        subscribe,
        set,
        load: async (bucketId: string) => {
            const response = await sdkForProject.storage.getBucket(bucketId);
            set(response);
        }
    };
}

function createFilesStore() {
    const { subscribe, set } = writable<Models.FileList>(
        browser ? JSON.parse(sessionStorage.getItem('files')) : null
    );

    return {
        subscribe,
        set,
        load: async (bucketId: string, search: string, limit: number, offset: number) => {
            const response = await sdkForProject.storage.listFiles(bucketId, search, limit, offset);
            set(response);
        }
    };
}

export const bucket = createBucketStore();
export const files = createFilesStore();

if (browser) {
    bucket.subscribe((n) => sessionStorage?.setItem('bucket', JSON.stringify(n ?? '')));
    files.subscribe((n) => sessionStorage?.setItem('files', JSON.stringify(n ?? '')));
}
