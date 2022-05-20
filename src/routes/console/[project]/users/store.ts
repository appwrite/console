import { sdkForProject } from '$lib/stores/sdk';
import { writable } from 'svelte/store';
import type { Models } from 'src/sdk';
import { browser } from '$app/env';

export type UsersList = {
    loading: boolean;
    response?: Models.UserList<Record<string, unknown>>;
};

function createUserStore() {
    const { subscribe, set } = writable<UsersList>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('users')) : null
    });

    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            try {
                const response = await sdkForProject.users.list(
                    search,
                    limit,
                    offset,
                    undefined,
                    undefined,
                    'DESC'
                );
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

export const usersList = createUserStore();

if (browser) {
    usersList.subscribe((n) => sessionStorage?.setItem('users', JSON.stringify(n.response ?? '')));
}
