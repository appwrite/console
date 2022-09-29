import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const bucketList = cachedStore<
    Models.BucketList,
    {
        load: (queries: string[], search: string) => Promise<void>;
    }
>('bucketList', function ({ set }) {
    return {
        load: async (queries, search) => {
            const response = await sdkForProject.storage.listBuckets(queries, search);
            set(response);
        }
    };
});
