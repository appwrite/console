import { page } from '$app/stores';
import { derived, writable, type Writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const destination = derived(page, ($page) => $page.data.destination as Models.Destination);
export const execute: Writable<Models.Destination> = writable();
