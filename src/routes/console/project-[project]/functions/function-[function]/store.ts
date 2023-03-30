import { page } from '$app/stores';
import { derived, writable, type Writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const func = derived(page, ($page) => $page.data.function as Models.Function);
export const execute: Writable<Models.Function> = writable();
