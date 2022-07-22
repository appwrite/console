import { sdkForProject } from '$lib/stores/sdk';
import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import { browser } from '$app/env';

function createUsersListStore() {
    const { subscribe, set } = writable<Models.UserList<Record<string, unknown>>>(
        browser ? JSON.parse(sessionStorage.getItem('users')) : null
    );

    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            const response = await sdkForProject.users.list(
                search,
                limit,
                offset,
                undefined,
                undefined,
                'DESC'
            );
            set(response);
        }
    };
}

function createTeamsListStore() {
    const { subscribe, set } = writable<Models.TeamList>(
        browser ? JSON.parse(sessionStorage.getItem('teams')) : null
    );

    return {
        subscribe,
        set,
        load: async (search: string, limit: number, offset: number) => {
            const response = await sdkForProject.teams.list(
                search,
                limit,
                offset,
                undefined,
                undefined,
                'DESC'
            );
            set(response);
        }
    };
}
function createUsersUsageStore() {
    const { subscribe, set } = writable(
        browser ? JSON.parse(sessionStorage.getItem('usersUsage')) : null
    );

    return {
        subscribe,
        set,
        load: async (range: string) => {
            const response = await sdkForProject.users.getUsage(range);
            set(response);
        }
    };
}

export const usersList = createUsersListStore();
export const teamsList = createTeamsListStore();
export const usersUsage = createUsersUsageStore();

if (browser) {
    usersList.subscribe((n) => sessionStorage?.setItem('users', JSON.stringify(n ?? '')));
    teamsList.subscribe((n) => sessionStorage?.setItem('teams', JSON.stringify(n ?? '')));
    usersUsage.subscribe((n) => sessionStorage?.setItem('usersUsage', JSON.stringify(n ?? '')));
}
