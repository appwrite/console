import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createTeamStore() {
    const { subscribe, set } = writable<Models.Team<Record<string, unknown>>>();

    return {
        subscribe,
        set,
        load: async (teamId: string) => {
            set(await sdkForProject.teams.get(teamId));
        }
    };
}

export const team = createTeamStore();
