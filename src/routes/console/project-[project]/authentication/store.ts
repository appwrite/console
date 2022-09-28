import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const usersList = cachedStore<
    Models.UserList<Record<string, unknown>>,
    {
        load: (queries: string[], search: string) => Promise<void>;
    }
>('users', function ({ set }) {
    return {
        load: async (queries, search) => {
            const response = await sdkForProject.users.list(queries, search);
            set(response);
        }
    };
});

export const teamsList = cachedStore<
    Models.TeamList,
    {
        load: (queries: string[], search: string) => Promise<void>;
    }
>('teams', function ({ set }) {
    return {
        load: async (queries, search) => {
            const response = await sdkForProject.teams.list(queries, search);
            set(response);
        }
    };
});

export const usersUsage = cachedStore<
    Models.UsageUsers,
    {
        load: (range: string) => Promise<void>;
    }
>('usersUsage', function ({ set }) {
    return {
        load: async (range) => {
            const response = await sdkForProject.users.getUsage(range);
            set(response);
        }
    };
});
