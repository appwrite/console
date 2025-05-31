import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const deployment = derived(page, ($page) => $page.data.deployment as Models.Deployment);
