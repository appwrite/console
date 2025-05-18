import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const installations = derived(
    page,
    ($page) => $page.data.installations as Models.InstallationList
);
export const repository = writable<Models.ProviderRepository>();
export const installation = writable<Models.Installation>();

export function sortBranches(branches: Models.Branch[]) {
    return branches.sort((a, b) => {
        if (a.name === 'main' || a.name === 'master') {
            return -1;
        }

        return a.name > b.name ? 1 : -1;
    });
}
