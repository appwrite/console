import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const repository = writable<Models.Repository>();
export const installation = writable<Models.Installation>();
export const choices = writable<{
    branch: string;
    rootDir: string;
    silentMode: boolean;
}>({
    branch: null,
    rootDir: null,
    silentMode: null
});

export const installations = derived(
    page,
    ($page) => $page.data.installations as Models.InstallationList
);
