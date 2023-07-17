import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const loading = writable(true);

export const organizations = derived(page, ($page) => {
    return $page.data.organizations as Models.TeamList<Models.Preferences>;
});
export const requestedMigration = writable<string | null>(null);
