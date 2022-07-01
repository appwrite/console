import { sdkForProject } from '$lib/stores/sdk';
import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

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

export const database = createDatabase();
