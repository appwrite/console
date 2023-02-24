import { page } from '$app/stores';
import { derived, writable, type Writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const source = derived(page, ($page) => $page.data.source as Models.Source);
export const execute: Writable<Models.Source> = writable();
