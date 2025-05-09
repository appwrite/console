import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const doc = derived(page, ($page) => $page.data.document as Models.Document);
