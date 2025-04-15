import type { RegionList } from '$lib/sdk/billing';
import { writable } from 'svelte/store';
import { consoleProfile } from '$lib/system';

export const createProject = writable<{
    id?: string;
    name: string;
    region: string;
}>({
    id: null,
    name: consoleProfile.defaultProjectName,
    region: 'fra'
});

export const regions = writable<RegionList | undefined>(undefined);
