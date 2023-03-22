import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';
import { derived, writable } from 'svelte/store';

export const database = derived(page, ($page) => $page.data.database as Models.Database);
export const showCreate = writable(false);
