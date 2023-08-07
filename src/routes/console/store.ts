import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const version = derived(page, ($page) => $page.data.version as string | null);
