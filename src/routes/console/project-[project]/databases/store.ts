import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const databaseList = cachedStore<
    Models.DatabaseList,
    {
        load: (queries: string[], search: string) => Promise<void>;
    }
>('databaseList', function ({ set }) {
    return {
        load: async (queries, search) => {
            const response = await sdkForProject.databases.list(queries, search);
            set(response);
        }
    };
});
