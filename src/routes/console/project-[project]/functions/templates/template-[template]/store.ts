import { page } from '$app/stores';
import type { MarketplaceTemplate } from '$lib/stores/marketplace';
import { derived } from 'svelte/store';

export const template = derived(page, ($page) => $page.data.template as MarketplaceTemplate);
