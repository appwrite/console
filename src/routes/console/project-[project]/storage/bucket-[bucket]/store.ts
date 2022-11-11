import { derived } from 'svelte/store';
import { page } from '$app/stores';

export const bucket = derived(page, ($page) => $page.data.bucket);
