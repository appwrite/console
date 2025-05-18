import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const bucket = derived(page, ($page) => $page.data.bucket as Models.Bucket);
