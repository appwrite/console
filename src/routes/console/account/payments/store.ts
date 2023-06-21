import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const publicKey = import.meta.env?.VITE_STRIPE_PUBLIC_KEY?.toString() as string | undefined;

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods);
