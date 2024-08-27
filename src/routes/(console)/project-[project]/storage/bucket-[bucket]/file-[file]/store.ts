import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const file = derived(page, ($page) => $page.data.file as Models.File);
