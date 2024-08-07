import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { Specification } from '$lib/sdk/functionsSpec';

export const runtimesList = derived(
    page,
    async ($page) => (await $page.data.runtimesList) as Models.RuntimeList
);

export const specifications = derived(
    page,
    async ($page) => (await $page.data.specifications.specifications) as Specification[]
);

export const baseRuntimesList = derived(runtimesList, async ($runtimesList) => {
    const baseRuntimes = new Map<string, Models.Runtime>();
    for (const runtime of (await $runtimesList).runtimes) {
        const runtimeBase = runtime.name.split('-')[0];
        baseRuntimes.set(runtimeBase, runtime);
    }
    return { runtimes: [...baseRuntimes.values()] };
});

export const functionsList = derived(page, ($page) => $page.data.functions as Models.FunctionList);
