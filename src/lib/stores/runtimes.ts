import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const runtimesList = derived(
    page,
    async ($page) => (await $page.data.runtimesList) as Models.RuntimeList
);

export const baseRuntimesList = derived(runtimesList, async ($runtimesList) => {
    const baseRuntimes = new Map<string, Models.Runtime>();
    for (const runtime of (await $runtimesList).runtimes) {
        const runtimeBase = runtime.name.split('-')[0];
        baseRuntimes.set(runtimeBase, runtime);
    }
    return { runtimes: [...baseRuntimes.values()] };
});
