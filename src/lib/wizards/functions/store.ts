import { page } from '$app/stores';
import type { MarketplaceTemplate } from '$lib/stores/marketplace';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const template = writable<MarketplaceTemplate>();
export const templateConfig = writable<{
    $id: string;
    name: string;
    runtime: string;
    variables: { [key: string]: string };
    repositoryBehaviour: 'new' | 'existing';
    repositoryName: string;
    repositoryPrivate: boolean;
    repositoryId: string;
    appwriteApiKey?: string;
    generateKey?: boolean;
}>();
export const repository = writable<Models.ProviderRepository>();
export const installation = writable<Models.Installation>();
export const choices = writable<{
    branch: string;
    rootDir: string;
    silentMode: boolean;
}>({
    branch: null,
    rootDir: null,
    silentMode: null
});

export const installations = derived(
    page,
    ($page) => $page.data.installations as Models.InstallationList
);

export const runtimes = derived(
    page,
    ($page) => $page.data.runtimes as Promise<Models.RuntimeList>
);

const initialCreateFunction: Partial<Models.Function> = {
    $id: null,
    name: null,
    entrypoint: null,
    execute: [],
    runtime: null,
    commands: null
};

function createFunctionStore() {
    const store = writable<Partial<Models.Function>>({
        ...initialCreateFunction
    });

    const reset = () => {
        store.set({ ...initialCreateFunction });
    };

    return {
        ...store,
        reset
    };
}
export const createFunction = createFunctionStore();

export const createFunctionDeployment = writable<FileList>();
