import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';
import { sdkForConsole } from './sdk';

function createUserStore() {
    const { subscribe, set } = writable<Models.User<Record<string, unknown>>>();

    return {
        subscribe,
        set,
        fetchUser: async () => {
            set(await sdkForConsole.account.get());
        }
    };
}

export const user = createUserStore();
