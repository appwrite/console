import { cachedStore } from '$lib/helpers/cache';
import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';

export const func = cachedStore<
    Models.Function,
    {
        load: (functionId: string) => Promise<void>;
    }
>('func', function ({ set }) {
    return {
        load: async (functionId) => {
            set(await sdkForProject.functions.get(functionId));
        }
    };
});

export const deploymentList = cachedStore<
    Models.DeploymentList,
    {
        load: (functionId: string, search: string, limit: number, offset: number) => Promise<void>;
    }
>('deploymentList', function ({ set }) {
    return {
        load: async (functionId, search, limit, offset) => {
            const response = await sdkForProject.functions.listDeployments(
                functionId,
                search,
                limit,
                offset
            );
            set(response);
        }
    };
});
