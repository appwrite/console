import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const platform = derived(page, ($page) => $page.data.platform as Models.Platform);
