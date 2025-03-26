import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const devKey = derived(page, ($page) => $page.data.key as Models.DevKey);
