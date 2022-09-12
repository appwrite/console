import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { sdkForConsole } from './sdk';

function createUserStore() {
    const { subscribe, set } = writable<Models.User<Record<string, unknown>>>();

    return {
        subscribe,
        set,
        fetchUser: async () => {
            set(await sdkForConsole.account.get());
        },
        logout: async () => {
            await sdkForConsole.account.deleteSession('current');
        }
    };
}

export const user = createUserStore();
