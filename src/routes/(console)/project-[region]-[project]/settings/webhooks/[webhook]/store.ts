import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const webhook = derived(page, ($page) => $page.data.webhook as Models.Webhook);
