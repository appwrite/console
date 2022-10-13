import { writable } from 'svelte/store';
import { sdkForConsole } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@aw-labs/appwrite-console';

export const createPlatform = writable<Partial<Models.Platform>>({
    name: null,
    hostname: null,
    type: null
});

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
            const { endpoint } = sdkForConsole.client.config;
            const response = await fetch(`${endpoint}/../versions`);
            set(await response.json());
        }
    };
});
