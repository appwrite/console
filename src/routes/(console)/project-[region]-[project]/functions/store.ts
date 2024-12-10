import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const functionsList = derived(page, ($page) => $page.data.functions as Models.FunctionList);
