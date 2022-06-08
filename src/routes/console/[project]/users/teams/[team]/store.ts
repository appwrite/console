import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createTeamStore() {
    const { subscribe, set } = writable<Models.Team>();

    return {
        subscribe,
        set,
        load: async (teamId: string) => {
            set(await sdkForProject.teams.get(teamId));
        }
    };
}
function createMembershipStore() {
    const { subscribe, set } = writable<Models.MembershipList>();

    return {
        subscribe,
        set,
        load: async (teamId: string, search: string, limit: number, offset: number) => {
            set(
                await sdkForProject.teams.getMemberships(
                    teamId,
                    search,
                    limit,
                    offset,
                    undefined,
                    undefined,
                    'DESC'
                )
            );
        }
    };
}

export const memberships = createMembershipStore();
export const team = createTeamStore();
