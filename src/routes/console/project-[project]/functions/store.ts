import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const runtimesList = derived(
    page,
    async ($page) => (await $page.data.runtimesList) as Models.RuntimeList
);

export const baseRuntimesList = derived(runtimesList, async ($runtimesList) => ({
    runtimes: (await $runtimesList).runtimes
        .map((runtime) => {
            const runtimeBase = runtime.name.split('-')[0];
            return { ...runtime, name: runtimeBase };
        })
        .filter((runtime, index, self) => self.findIndex((n) => n.name === runtime.name) === index)
}));
