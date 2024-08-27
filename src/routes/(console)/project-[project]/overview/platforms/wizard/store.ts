import { writable } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
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

export const versions = cachedStore<
    {
        server: string;
        'client-web': string;
        'client-flutter': string;
        'client-apple': string;
        'client-android': string;
        'console-web': string;
        'console-cli': string;
        'server-nodejs': string;
        'server-deno': string;
        'server-php': string;
        'server-python': string;
        'server-ruby': string;
        'server-dart': string;
        'server-kotlin': string;
        'server-swift': string;
    },
    {
        load: () => Promise<void>;
    }
>('versions', function ({ set }) {
    return {
        load: async () => {
            const { endpoint, project } = sdk.forConsole.client.config;
            const response = await fetch(`${endpoint}/../versions`, {
                headers: {
                    'X-Appwrite-Project': project
                }
            });
            set(await response.json());
        }
    };
});
