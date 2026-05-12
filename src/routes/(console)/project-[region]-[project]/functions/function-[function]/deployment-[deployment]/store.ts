import { page } from '$lib/stores/page';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const deployment = derived(page, ($page) => $page.data.deployment as Models.Deployment);
