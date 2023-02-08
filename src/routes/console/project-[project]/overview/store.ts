import { sdkForConsole } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@aw-labs/appwrite-console';

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (projectId: string, range: string) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (projectId, range) => {
            const usages = await sdkForConsole.projects.getUsage(projectId, range);
            set(usages);
        }
    };
});
