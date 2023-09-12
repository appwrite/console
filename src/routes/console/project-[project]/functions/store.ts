import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const runtimesList = derived(
    page,
    async ($page) => (await $page.data.runtimesList) as Models.RuntimeList
);
