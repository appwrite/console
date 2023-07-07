import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods);
