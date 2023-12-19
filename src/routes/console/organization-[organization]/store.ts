import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const showExcess = writable<boolean>(false);
export const projects = derived(page, ($page) => $page.data?.projects as Models.ProjectList);
