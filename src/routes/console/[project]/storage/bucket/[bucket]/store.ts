import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type FilesList = {
    loading: boolean;
    response?: Models.FileList;
};
export type SelectedBucket = {
    loading: boolean;
    response?: Models.Bucket;
};

function createBucketStore() {
    const { subscribe, set } = writable<SelectedBucket>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('bucket')) : null
    });

    return {
        subscribe,
        set,
        load: async (bucketId: string) => {
            try {
                const response = await sdkForProject.storage.getBucket(bucketId);
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

function createFilesStore() {
    const { subscribe, set } = writable<FilesList>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('files')) : null
    });

    return {
        subscribe,
        set,
        load: async (bucketId: string, search: string, limit: number, offset: number) => {
            try {
                const response = await sdkForProject.storage.listFiles(
                    bucketId,
                    search,
                    limit,
                    offset
                );
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

export const bucket = createBucketStore();
export const files = createFilesStore();

if (browser) {
    bucket.subscribe((n) => sessionStorage?.setItem('bucket', JSON.stringify(n.response ?? '')));
    files.subscribe((n) => sessionStorage?.setItem('files', JSON.stringify(n.response ?? '')));
}
