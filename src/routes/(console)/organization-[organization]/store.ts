import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';
import type { RegionList } from '$lib/sdk/billing';
import { sdk } from '$lib/stores/sdk';

export const regions = writable<RegionList | undefined>(undefined);
export const regionFlagUrls = derived(regions, ($regions) => {
    if (!$regions?.regions?.length) return [];

    return $regions?.regions?.map((region) => {
        return `${sdk.forConsole.client.config.endpoint}/avatars/flags/${region.flag}?width=80&height=60&quality=100&mode=admin`;
    });
});

export const projects = derived(page, ($page) => $page.data?.projects as Models.ProjectList);
