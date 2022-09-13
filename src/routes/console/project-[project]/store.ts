import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const project = cachedStore<
    Models.Project,
    {
        load: (projectId: string) => Promise<void>;
    }
>('project', function ({ set }) {
    return {
        load: async (projectId: string) => {
            const project = await sdkForConsole.projects.get(projectId);
            set(project);
        }
    };
});
