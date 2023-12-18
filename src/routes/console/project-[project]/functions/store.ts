import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { Column } from '$lib/components/viewSelector.svelte';
import { toLocaleDateTime } from '$lib/helpers/date';
import { writable } from 'svelte/store';

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

export const columns = writable<Column[]>([
    {
        id: '$id',
        title: 'Function ID',
        show: true,
        width: 150
    },
    {
        id: 'name',
        title: 'Name',
        show: true,
        width: 120
    },
    {
        id: '$createdAt',
        title: 'Created',
        show: true,
        width: 120,
        transform: toLocaleDateTime
    },
    {
        id: '$updatedAt',
        title: 'Updated',
        show: true,
        width: 120,
        transform: toLocaleDateTime
    }
]);
