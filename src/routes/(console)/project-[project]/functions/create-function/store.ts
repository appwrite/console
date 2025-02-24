import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
import type { Models } from '@appwrite.io/console';
import { writable, type Writable } from 'svelte/store';

export const template = writable<Models.TemplateFunction>();
export const templateConfig = writable<{
    $id: string;
    name: string;
    runtime: string;
    variables: { [key: string]: unknown };
    repositoryBehaviour: 'new' | 'existing' | 'manual';
    repositoryName?: string;
    repositoryPrivate?: boolean;
    repositoryId: string;
    execute?: boolean;
    scopes?: string[];
    specification?: string;
}>();

export const choices = writable<{
    branch: string;
    rootDir: string;
    silentMode: boolean;
}>({
    branch: null,
    rootDir: null,
    silentMode: null
});

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

export const templateStepsComponents: Writable<WizardStepsType> = writable(new Map());
