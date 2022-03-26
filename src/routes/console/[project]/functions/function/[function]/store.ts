import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createFunctionStore() {
    const { subscribe, set } = writable<Models.Function>();

    return {
        subscribe,
        set,
        load: async (functionId: string) => {
            set(await sdkForProject.functions.get(functionId));
        }
    };
}

export const func = createFunctionStore();
