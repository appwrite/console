import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const provider = derived(page, ($page) => $page.data.provider as Models.Provider);
