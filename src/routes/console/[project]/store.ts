import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

function createProject() {
    const { subscribe, set } = writable<Models.Project>();

    return {
        subscribe,
        set,
        load: async (projectId: string) => {
            const project = await sdkForConsole.projects.get(projectId);
            set(project);
        }
    };
}

function createOrganisation() {
    const { subscribe, set } = writable<Models.Team>();

    return {
        subscribe,
        set,
        load: async (teamId: string) => {
            const team = await sdkForConsole.teams.get(teamId);
            set(team);
        }
    };
}

export const project = createProject();
export const organisation = createOrganisation();
