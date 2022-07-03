import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type SelectedFile = {
    loading: boolean;
    response?: Models.File;
};

function createFileStore() {
    const { subscribe, set } = writable<SelectedFile>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('file')) : null
    });

    return {
        subscribe,
        set,
        load: async (bucketId: string, fileId: string) => {
            try {
                const response = await sdkForProject.storage.getFile(bucketId, fileId);
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

export const file = createFileStore();

if (browser) {
    file.subscribe((n) => sessionStorage?.setItem('file', JSON.stringify(n.response ?? '')));
}
