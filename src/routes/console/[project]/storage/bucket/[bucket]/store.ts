import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type FilesList = {
    loading: boolean;
    response?: Models.FileList;
};

function createBucketStore() {
    const { subscribe, set } = writable<Models.Bucket>();

    return {
        subscribe,
        set,
        load: async (bucketId: string) => {
            set(await sdkForProject.storage.getBucket(bucketId));
        }
    };
}

function createFilesStore() {
    const { subscribe, set } = writable<FilesList>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('users')) : null
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
    files.subscribe((n) => sessionStorage?.setItem('files', JSON.stringify(n.response ?? '')));
}
