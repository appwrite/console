import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const message = derived(
    page,
    ($page) => $page.data.message as Models.Message & { data: Record<string, string> }
);
