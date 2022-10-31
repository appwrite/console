import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';

export const project = derived(page, ($page) => $page.data.project as Models.Project);
