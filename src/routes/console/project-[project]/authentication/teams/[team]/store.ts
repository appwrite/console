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
        load: (teamId: string, search: string, limit: number, offset: number) => Promise<void>;
    }
>('memberships', function ({ set }) {
    return {
        load: async (teamId, search, limit, offset) => {
            const response = await sdkForProject.teams.getMemberships(
                teamId,
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
