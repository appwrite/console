import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const executionList = cachedStore<
    Models.ExecutionList,
    {
        load: (functionId: string, limit: number, offset: number, search: string) => Promise<void>;
    }
>('executionList', function ({ set }) {
    return {
        load: async (functionId, limit, offset, search) => {
            const response = await sdkForProject.functions.listExecutions(
                functionId,
                limit,
                offset,
                search
            );
            set(response);
        }
    };
});
