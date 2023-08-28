import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export const consoleVariables = derived(
    page,
    ($page) => $page.data.consoleVariables as Models.ConsoleVariables
);
