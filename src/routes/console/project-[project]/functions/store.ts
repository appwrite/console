import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const functionList = cachedStore<
    Models.FunctionList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
    }
>('functionList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForProject.functions.list(search, limit, offset);
            set(response);
        }
    };
});

export const runtimeList = cachedStore<
    Models.RuntimeList,
    {
        load: () => Promise<void>;
    }
>('runtimeList', function ({ set }) {
    return {
        load: async () => {
            const response = await sdkForProject.functions.listRuntimes();
            set(response);
        }
    };
});
