import { page } from '$app/stores';
import type { AggregationList } from '$lib/sdk/billing';
import { derived, writable } from 'svelte/store';

export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as AggregationList
);

export const addCreditWizardStore = writable<{ coupon: string; paymentId: string }>({
    coupon: null,
    paymentId: null
});
