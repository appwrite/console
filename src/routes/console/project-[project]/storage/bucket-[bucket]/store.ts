import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';

export const bucket = derived(page, ($page) => $page.data.bucket as Models.Bucket);
