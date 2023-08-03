import { page } from '$app/stores';
import type { AddressesList } from '$lib/sdk/billing';
import { derived } from 'svelte/store';

export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as string | null
);
