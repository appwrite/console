import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const projects = derived(page, ($page) => $page.data?.projects as Models.ProjectList);
