import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const platform = cachedStore<
    Models.Platform,
    {
        load: (projectId: string, platformId: string) => Promise<void>;
    }
>('platform', function ({ set }) {
    return {
        load: async (projectId, platformId) => {
            const platform = await sdkForConsole.projects.getPlatform(projectId, platformId);
            set(platform);
        }
    };
});
