import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type SelectedUser = {
    loading: boolean;
    response?: Models.User<Record<string, unknown>>;
};

function createUserStore() {
    const { subscribe, set } = writable<SelectedUser>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('user')) : null
    });

    return {
        subscribe,
        set,
        load: async (userId: string) => {
            try {
                const response = await sdkForProject.users.get(userId);
                set({
                    loading: false,
                    response
                });
            } catch (error) {
                //TODO: take care what happens here
            }
        }
    };
}

export const user = createUserStore();

if (browser) {
    user.subscribe((n) => sessionStorage?.setItem('user', JSON.stringify(n.response ?? '')));
}
