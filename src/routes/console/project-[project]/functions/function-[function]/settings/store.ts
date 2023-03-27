import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const variables = derived(
    page,
    ($page) => $page.data.variables.variables as Models.Variable[]
);
