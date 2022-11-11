import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';

export const key = derived(page, ($page) => $page.data.key as Models.Key);
