import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const variables = derived(
    page,
    ($page) => $page.data.variables.variables as Models.Variable[]
);
