import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const domain = derived(page, ($page) => $page.data.domain as Models.ProxyRule);
