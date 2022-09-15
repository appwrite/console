import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const databaseList = cachedStore<
    Models.DatabaseList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
    }
>('databaseList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForProject.databases.list(search, limit, offset);
            set(response);
        }
    };
});
