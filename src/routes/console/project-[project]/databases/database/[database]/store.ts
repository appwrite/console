import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { browser } from '$app/environment';
import { cachedStore } from '$lib/helpers/cache';

export const collections = cachedStore<
    Models.CollectionList,
    {
        load: (databaseId: string, queries: string[], search: string) => Promise<void>;
        total: (databaseId: string, id: string) => Promise<Record<string, unknown>>;
    }
>('collections', function ({ set }) {
    return {
        load: async (databaseId, queries, search) => {
            const response = await sdkForProject.databases.listCollections(
                databaseId,
                queries,
                search
            );
            set(response);
        },
        total: async (databaseId, id) => {
            let total = {};
            total = browser ? JSON.parse(sessionStorage.getItem('collectionTotal')) ?? {} : {};
            const response = await sdkForProject.databases.listDocuments(databaseId, id);
            total[id] = response.total;
            sessionStorage?.setItem('collectionTotal', JSON.stringify(total));
            return total;
        }
    };
});

export const database = cachedStore<
    Models.Database,
    {
        load: (databaseId: string) => Promise<void>;
    }
>('database', function ({ set }) {
    return {
        load: async (databaseId) => {
            set(await sdkForProject.databases.get(databaseId));
        }
    };
});
