import { writable } from 'svelte/store';
import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';

function createDeployment() {
    const { subscribe, update } = writable<Models.Deployment>();
    return {
        subscribe,
        update,
        set: async (functionId: string, deploymentId: string) => {
            const response = await sdkForProject.functions.getDeployment(functionId, deploymentId);
            return response;
        }
    };
}

export const deployment = createDeployment();
