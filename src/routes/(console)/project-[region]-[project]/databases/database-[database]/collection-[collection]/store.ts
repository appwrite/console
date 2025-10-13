import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const indexes = derived(page, ($page) => $page.data.collection.indexes as Models.Index[]);
