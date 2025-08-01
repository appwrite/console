import { writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

function createPlatformStore() {
    const { subscribe, update, set } = writable<Partial<Models.Platform>>({
        $id: null,
        name: null,
        hostname: null,
        key: null,
        store: null,
        type: null
    });

    return {
        subscribe,
        update,
        set,
        reset() {
            set({
                $id: null,
                name: null,
                hostname: null,
                key: null,
                store: null,
                type: null
            });
        }
    };
}

export const createPlatform = createPlatformStore();
