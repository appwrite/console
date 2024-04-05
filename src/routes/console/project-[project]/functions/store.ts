import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const runtimesList = derived(page, async ($page) => {
    const { runtimes } = (await $page.data.runtimes) as Models.RuntimeList;
    const filtered = runtimes.filter((runtime) => !runtime.name.startsWith('python-ml'));
    return { runtimes: filtered, total: filtered.length };
});

export const baseRuntimesList = derived(runtimesList, async ($runtimesList) => {
    const baseRuntimes = new Map<string, Models.Runtime>();
    for (const runtime of (await $runtimesList).runtimes) {
        const runtimeBase = runtime.name.split('-')[0];
        baseRuntimes.set(runtimeBase, runtime);
    }
    return { runtimes: [...baseRuntimes.values()] };
});

export const functionsList = derived(page, ($page) => $page.data.functions as Models.FunctionList);
