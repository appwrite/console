import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const file = cachedStore<
    Models.File,
    {
        load: (bucketId: string, fileId: string) => Promise<void>;
    }
>('file', function ({ set }) {
    return {
        load: async (bucketId, fileId) => {
            const response = await sdkForProject.storage.getFile(bucketId, fileId);
            set(response);
        }
    };
});
