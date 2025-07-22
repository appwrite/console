import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const row = derived(page, ($page) => $page.data.row as Models.Row);
