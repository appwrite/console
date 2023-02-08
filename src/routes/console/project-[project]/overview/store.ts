import { sdkForProject } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@aw-labs/appwrite-console';

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (range: string) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (range) => {
            const usages = await sdkForProject.project.getUsage(range);
            set(usages);
        }
    };
});
