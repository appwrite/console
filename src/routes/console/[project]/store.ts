import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
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

export const project = createProject();
