import { page } from '$app/stores';
import type { HeaderAlert } from '$lib/stores/headerAlert';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const version = derived(page, ($page) => $page.data.version as string | null);
export const consoleVariables = derived(
    page,
    ($page) => $page.data.consoleVariables as Models.ConsoleVariables
);

export const showPostReleaseModal = writable(false);

export const activeHeaderAlert = writable<HeaderAlert>(null);
