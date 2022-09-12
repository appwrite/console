import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const usersList = cachedStore<
    Models.UserList<Record<string, unknown>>,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
    }
>('users', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
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
});

export const teamsList = cachedStore<
    Models.TeamList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
    }
>('teams', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
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
