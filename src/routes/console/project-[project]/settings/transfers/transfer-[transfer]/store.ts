import { page } from '$app/stores';
import { derived, writable, type Writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const transfer = derived(page, ($page) => $page.data.transfer as Models.Transfer);
export const execute: Writable<Models.Transfer> = writable();
