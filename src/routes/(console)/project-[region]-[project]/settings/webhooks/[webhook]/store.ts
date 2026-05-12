import { derived } from 'svelte/store';
import { page } from '$lib/stores/page';
import type { Models } from '@appwrite.io/console';

export const webhook = derived(page, ($page) => $page.data.webhook as Models.Webhook);
