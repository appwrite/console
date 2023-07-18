import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const creditList = derived(page, ($page) => $page.data.creditList);
