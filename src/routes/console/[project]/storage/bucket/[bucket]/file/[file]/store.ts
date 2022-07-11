import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createFileStore() {
    const { subscribe, set } = writable<Models.File>(
        browser ? JSON.parse(sessionStorage.getItem('file')) : null
    );

    return {
        subscribe,
        set,
        load: async (bucketId: string, fileId: string) => {
            const response = await sdkForProject.storage.getFile(bucketId, fileId);
            set(response);
        }
    };
}

export const file = createFileStore();

if (browser) {
    file.subscribe((n) => sessionStorage?.setItem('file', JSON.stringify(n ?? '')));
}
