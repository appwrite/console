import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createFileStore() {
    const { subscribe, set } = writable<Models.File>();

    return {
        subscribe,
        set,
        load: async (bucketId: string, fileId: string) => {
            set(await sdkForProject.storage.getFile(bucketId, fileId));
        }
    };
}

export const file = createFileStore();
