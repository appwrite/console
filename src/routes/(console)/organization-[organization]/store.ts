import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';
import type { RegionList } from '$lib/sdk/billing';

export const regions = writable<RegionList | undefined>(undefined);

export const projects = derived(page, ($page) => $page.data?.projects as Models.ProjectList);
