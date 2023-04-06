import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const doc = derived(page, ($page) => $page.data.document as Models.Document);
