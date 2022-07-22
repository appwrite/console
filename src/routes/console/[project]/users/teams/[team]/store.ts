import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createTeamStore() {
    const { subscribe, set } = writable<Models.Team>(
        browser ? JSON.parse(sessionStorage.getItem('team')) : null
    );

    return {
        subscribe,
        set,
        load: async (teamId: string) => {
            const response = await sdkForProject.teams.get(teamId);
            set(response);
        }
    };
}
function createMembershipStore() {
    const { subscribe, set } = writable<Models.MembershipList>(
        browser ? JSON.parse(sessionStorage.getItem('memberships')) : null
    );

    return {
        subscribe,
        set,
        load: async (teamId: string, search: string, limit: number, offset: number) => {
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
}

export const memberships = createMembershipStore();
export const team = createTeamStore();

if (browser) {
    team.subscribe((n) => sessionStorage?.setItem('team', JSON.stringify(n ?? '')));
    memberships.subscribe((n) => sessionStorage?.setItem('memberships', JSON.stringify(n ?? '')));
}
