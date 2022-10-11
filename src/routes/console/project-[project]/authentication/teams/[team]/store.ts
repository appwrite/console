import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const team = cachedStore<
    Models.Team,
    {
        load: (teamId: string) => Promise<void>;
    }
>('team', function ({ set }) {
    return {
        load: async (teamId: string) => {
            const response = await sdkForProject.teams.get(teamId);
            set(response);
        }
    };
});
export const memberships = cachedStore<
    Models.MembershipList,
    {
        load: (teamId: string, queries: string[], search: string) => Promise<void>;
    }
>('memberships', function ({ set }) {
    return {
        load: async (teamId, queries, search) => {
            const response = await sdkForProject.teams.listMemberships(teamId, queries, search);
            set(response);
        }
    };
});
