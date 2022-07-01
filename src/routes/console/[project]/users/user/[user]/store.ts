import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type SelectedUser = {
    loading: boolean;
    response?: Models.User<Record<string, unknown>>;
};

function createUserStore() {
    const { subscribe, set } = writable<SelectedUser>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('selectedUser')) : null
    });

    return {
        subscribe,
        set,
        load: async (userId: string) => {
            const response = await sdkForProject.users.get(userId);
            set({
                loading: false,
                response
            });
        }
    };
}

export const user = createUserStore();

if (browser) {
    user.subscribe((n) =>
        sessionStorage?.setItem('selectedUser', JSON.stringify(n.response ?? ''))
    );
}
