import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const executionList = cachedStore<
    Models.ExecutionList,
    {
        load: (functionId: string, queries?: string[], search?: string) => Promise<void>;
    }
>('executionList', function ({ set }) {
    return {
        load: async (functionId, queries, search) => {
            const response = await sdkForProject.functions.listExecutions(
                functionId,
                queries,
                search
            );
            set(response);
        }
    };
});
