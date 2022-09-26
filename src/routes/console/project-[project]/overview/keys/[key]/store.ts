import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const key = cachedStore<
    Models.Key,
    {
        load: (projectId: string, keyId: string) => Promise<void>;
    }
>('key', function ({ set }) {
    return {
        load: async (projectId, keyId) => {
            const key = await sdkForConsole.projects.getKey(projectId, keyId);
            set(key);
        }
    };
});
