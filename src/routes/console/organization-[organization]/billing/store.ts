import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const addressList = derived(page, ($page) => $page.data.addressList as string | null);
export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as string | null
);
