import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const bucketList = cachedStore<
    Models.BucketList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
    }
>('bucketList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForProject.storage.listBuckets(search, limit, offset);
            set(response);
        }
    };
});
