import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const runtimes = derived(
    page,
    async ($page) => (await $page.data.runtimes) as Models.RuntimeList
);
