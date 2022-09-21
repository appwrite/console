import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';
import { browser } from '$app/environment';

export const functionList = cachedStore<
    Models.FunctionList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
        getDeployments: (
            functions: Models.Function[]
        ) => Promise<Record<string, Models.Deployment>>;
    }
>('functionList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForProject.functions.list(search, limit, offset);
            set(response);
        },

        getDeployments: async (functions) => {
            let activeDeployments = {};
            activeDeployments = browser
                ? JSON.parse(sessionStorage.getItem('activeDeployments')) ?? {}
                : {};

            for (let i = 0; i < functions.length; i++) {
                const fn = functions[i];
                if (fn.deployment) {
                    const response = await sdkForProject.functions.getDeployment(
                        fn.$id,
                        fn.deployment
                    );
                    activeDeployments[fn.$id] = response;
                }
            }

            sessionStorage?.setItem('activeDeployments', JSON.stringify(activeDeployments));
            return activeDeployments;
        }
    };
});
