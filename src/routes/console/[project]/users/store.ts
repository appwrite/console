import { sdkForProject } from '$lib/stores/sdk';
import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import { browser } from '$app/env';

export type UsersList = {
    loading: boolean;
    response?: Models.UserList<Record<string, unknown>>;
};

export type TeamsList = {
    loading: boolean;
    response?: Models.TeamList;
};

function createUsersListStore() {
    const { subscribe, set } = writable<UsersList>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('users')) : null
    });

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
            set({
                loading: false,
                response
            });
        }
    };
}

function createTeamsListStore() {
    const { subscribe, set } = writable<TeamsList>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('teams')) : null
    });

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
            set({
                loading: false,
                response
            });
        }
    };
}
function createUsersUsageStore() {
    const { subscribe, set } = writable({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('usersUsage')) : null
    });

    return {
        subscribe,
        set,
        load: async (range: string) => {
            const response = await sdkForProject.users.getUsage(range);
            set({
                loading: false,
                response
            });
        }
    };
}

export const usersList = createUsersListStore();
export const teamsList = createTeamsListStore();
export const usersUsage = createUsersUsageStore();

if (browser) {
    usersList.subscribe((n) => sessionStorage?.setItem('users', JSON.stringify(n.response ?? '')));
    teamsList.subscribe((n) => sessionStorage?.setItem('teams', JSON.stringify(n.response ?? '')));
    usersUsage.subscribe((n) =>
        sessionStorage?.setItem('usersUsage', JSON.stringify(n.response ?? ''))
    );
}
