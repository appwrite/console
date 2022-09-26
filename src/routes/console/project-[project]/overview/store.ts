import { sdkForConsole } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@aw-labs/appwrite-console';

export type UsagePeriods = '24h' | '30d' | '90d';
export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (projectId: string, range: UsagePeriods) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (projectId, range) => {
            const usages = await sdkForConsole.projects.getUsage(projectId, range);
            set(usages);
        }
    };
});
