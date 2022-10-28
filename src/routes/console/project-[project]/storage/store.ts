import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const bucketList = cachedStore<
    Models.BucketList,
    {
        load: (queries: string[]) => Promise<void>;
    }
>('bucketList', function ({ set }) {
    return {
        load: async (queries) => {
            const response = await sdkForProject.storage.listBuckets(queries);
            set(response);
        }
    };
});

export const storageUsage = cachedStore<
    Models.UsageStorage,
    {
        load: (range: string) => Promise<void>;
    }
>('storageUsage', function ({ set }) {
    return {
        load: async (range) => {
            const response = await sdkForProject.storage.getUsage(range);
            set(response);
        }
    };
});
