import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';
import { browser } from '$app/environment';

export const functionList = cachedStore<
    Models.FunctionList,
    {
        load: (queries?: string[], search?: string) => Promise<void>;
        getDeployments: (
            functions: Models.Function[]
        ) => Promise<Record<string, Models.Deployment>>;
    }
>('functionList', function ({ set }) {
    return {
        load: async (queries, search) => {
            const response = await sdkForProject.functions.list(queries, search);
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

export const variableList = cachedStore<
    Models.VariableList,
    {
        load: (functionId: string) => Promise<void>;
        delete: (functionId: string, variableId: string) => Promise<void>;
        create: (functionId: string, key: string, value: string) => Promise<void>;
        update: (
            functionId: string,
            variableId: string,
            key: string,
            value: string
        ) => Promise<void>;
    }
>('variableList', function ({ set }) {
    return {
        load: async (functionId) => {
            const response = await sdkForProject.functions.listVariables(functionId);
            set(response);
        },
        delete: async (functionId, variableId) => {
            await sdkForProject.functions.deleteVariable(functionId, variableId);
        },
        create: async (functionId, key, value) => {
            await sdkForProject.functions.createVariable(functionId, key, value);
        },
        update: async (functionId, variableId, key, value) => {
            await sdkForProject.functions.updateVariable(functionId, variableId, key, value);
        }
    };
});
