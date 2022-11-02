import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';

export const database = derived(page, ($page) => $page.data.database as Models.Database);
