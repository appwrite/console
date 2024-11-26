import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const site = derived(page, ($page) => $page.data.site as Models.Site);
