import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';
import { browser } from '$app/env';

export const bucketList = cachedStore<
    Models.BucketList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
        count: (id: string) => Promise<Record<string, unknown>>;
    }
>('bucketList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForProject.storage.listBuckets(search, limit, offset);
            set(response);
        },
        count: async (id) => {
            let total = {};
            total = browser ? JSON.parse(sessionStorage.getItem('bucketCount')) ?? {} : {};
            const response = await sdkForProject.storage.listFiles(id);
            total[id] = response.total;
            sessionStorage?.setItem('bucketCount', JSON.stringify(total));
            return total;
        }
    };
});
