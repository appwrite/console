import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as string | null
);
