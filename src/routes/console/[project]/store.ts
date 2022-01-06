import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createProject() {
	const { subscribe, set } = writable<Models.Project>();

	return {
		subscribe,
		set,
		load: async (projectId: string) => {
			set(await sdkForConsole.projects.get(projectId));
		}
	};
}

export const project = createProject();
