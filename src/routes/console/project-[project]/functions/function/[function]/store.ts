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
        updateDeployment: (deployment: Models.Deployment) => void;
    }
>('deploymentList', function ({ set, update }) {
    return {
        load: async (functionId, search, limit, offset) => {
            const response = await sdkForProject.functions.listDeployments(
                functionId,
                search,
                limit,
                offset
            );
            set(response);
        },
        updateDeployment: (deployment) =>
            update((n) => {
                const index = n.deployments.findIndex((a) => a.$id === deployment.$id);
                if (index !== -1) {
                    n.deployments[index] = deployment;
                }

                return n;
            })
    };
});
