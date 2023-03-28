import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const team = derived(
    page,
    ($page) => $page.data.team as Models.Team<Record<string, unknown>>
);
