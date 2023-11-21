import { page } from '$app/stores';
import type { AggregationList } from '$lib/sdk/billing';
import { derived } from 'svelte/store';

export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as AggregationList
);
