import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const functionList = cachedStore<
    Models.FunctionList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
        getDeployment: (functionId: string, deploymentId: string) => Promise<Models.Deployment>;
    }
>('functionList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForProject.functions.list(search, limit, offset);
            set(response);
        },

        getDeployment: async (functionId, deploymentId) => {
            return await sdkForProject.functions.getDeployment(functionId, deploymentId);
        }
    };
});
