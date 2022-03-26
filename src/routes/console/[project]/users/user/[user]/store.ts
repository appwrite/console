import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createUserStore() {
    const { subscribe, set } = writable<Models.User<Record<string, unknown>>>();

    return {
        subscribe,
        set,
        load: async (userId: string) => {
            set(await sdkForProject.users.get(userId));
        }
    };
}

export const user = createUserStore();
