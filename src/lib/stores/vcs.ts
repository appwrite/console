import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const installations = derived(
    page,
    ($page) => $page.data.installations as Models.InstallationList
);
export const repository = writable<Models.ProviderRepository>();
export const installation = writable<Models.Installation>();
