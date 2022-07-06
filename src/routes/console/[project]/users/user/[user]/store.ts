import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createUserStore() {
    const { subscribe, set } = writable<Models.User<Record<string, unknown>>>(
        browser ? JSON.parse(sessionStorage.getItem('selectedUser')) : null
    );

    return {
        subscribe,
        set,
        load: async (userId: string) => {
            const response = await sdkForProject.users.get(userId);
            set(response);
        }
    };
}

export const user = createUserStore();

if (browser) {
    user.subscribe((n) => sessionStorage?.setItem('selectedUser', JSON.stringify(n ?? '')));
}
