import { writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

function createKeyStore() {
    const { subscribe, update, set } = writable<Partial<Models.Key>>({
        name: null,
        expire: null,
        scopes: []
    });

    return {
        subscribe,
        update,
        set,
        reset() {
            set({
                name: null,
                expire: null,
                scopes: []
            });
        }
    };
}

export const key = createKeyStore();
