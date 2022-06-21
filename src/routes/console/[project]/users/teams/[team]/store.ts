import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export type Team = {
    loading: boolean;
    response?: Models.Team;
};
export type Memberships = {
    loading: boolean;
    response?: Models.MembershipList;
};

function createTeamStore() {
    const { subscribe, set } = writable<Team>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('team')) : null
    });

    return {
        subscribe,
        set,
        load: async (teamId: string) => {
            try {
                const response = await sdkForProject.teams.get(teamId);
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
function createMembershipStore() {
    const { subscribe, set } = writable<Memberships>({
        loading: true,
        response: browser ? JSON.parse(sessionStorage.getItem('memberships')) : null
    });

    return {
        subscribe,
        set,
        load: async (teamId: string, search: string, limit: number, offset: number) => {
            try {
                const response = await sdkForProject.teams.getMemberships(
                    teamId,
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

export const memberships = createMembershipStore();
export const team = createTeamStore();

if (browser) {
    team.subscribe((n) => sessionStorage?.setItem('team', JSON.stringify(n.response ?? '')));
    memberships.subscribe((n) =>
        sessionStorage?.setItem('memberships', JSON.stringify(n.response ?? ''))
    );
}
