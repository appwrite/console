import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const user = derived(
    page,
    ($page) => $page.data.account as Models.Account<Record<string, string>>
);
