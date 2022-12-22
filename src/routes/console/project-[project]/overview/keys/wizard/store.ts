import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import type { Nullable } from 'vitest';

type KeyStore = {
    name: Nullable<Models.Key['name']>;
    expire: Nullable<Models.Key['expire']>;
    scopes: Models.Key['scopes'];
};

function createKeyStore() {
    const { subscribe, update, set } = writable<KeyStore>({
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
