import { sdkForProject } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@aw-labs/appwrite-console';

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

export const databasesUsage = cachedStore<
    Models.UsageDatabases,
    {
        load: (range: string) => Promise<void>;
    }
>('databasesUsage', function ({ set }) {
    return {
        load: async (range) => {
            const usages = await sdkForProject.databases.getUsage(range);
            set(usages);
        }
    };
});
