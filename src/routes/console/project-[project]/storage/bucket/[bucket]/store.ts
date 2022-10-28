import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const bucket = cachedStore<
    Models.Bucket,
    {
        load: (bucketId: string) => Promise<void>;
    }
>('bucket', function ({ set }) {
    return {
        load: async (bucketId) => {
            const response = await sdkForProject.storage.getBucket(bucketId);
            set(response);
        }
    };
});

export const files = cachedStore<
    Models.FileList,
    {
        load: (bucketId: string, queries: string[], search: string) => Promise<void>;
    }
>('files', function ({ set }) {
    return {
        load: async (bucketId, queries, search) => {
            const response = await sdkForProject.storage.listFiles(bucketId, queries, search);
            set(response);
        }
    };
});

export const bucketUsage = cachedStore<
    Models.UsageBuckets,
    {
        load: (bucketId: string, range: string) => Promise<void>;
    }
>('bucketsUsage', function ({ set }) {
    return {
        load: async (bucketId, range) => {
            const response = await sdkForProject.storage.getBucketUsage(bucketId, range);
            set(response);
        }
    };
});
