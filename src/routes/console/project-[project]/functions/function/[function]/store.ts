import { cachedStore } from '$lib/helpers/cache';
import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable, type Writable } from 'svelte/store';

export const func = cachedStore<
    Models.Function,
    {
        load: (functionId: string) => Promise<void>;
        getDeployment: (functionId: string, deploymentId: string) => Promise<Models.Deployment>;
    }
>('func', function ({ set }) {
    return {
        load: async (functionId) => {
            set(await sdkForProject.functions.get(functionId));
        },
        getDeployment: async (functionId, deploymentId) => {
            return await sdkForProject.functions.getDeployment(functionId, deploymentId);
        }
    };
});

export const deploymentList = cachedStore<
    Models.DeploymentList,
    {
        load: (functionId: string, queries?: string[], search?: string) => Promise<void>;
        createDeployment: (deployment: Models.Deployment) => void;
        updateDeployment: (deployment: Models.Deployment) => void;
    }
>('deploymentList', function ({ set, update }) {
    return {
        load: async (functionId, queries, search) => {
            const response = await sdkForProject.functions.listDeployments(
                functionId,
                queries,
                search
            );
            set(response);
        },
        createDeployment: (deployment) =>
            update((n) => {
                n.deployments.unshift(deployment);

                return n;
            }),
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

export const execute: Writable<Models.Function> = writable();
