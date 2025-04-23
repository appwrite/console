import type { RegionList } from '$lib/sdk/billing';
import { writable } from 'svelte/store';

export const createProject = writable<{
    id?: string;
    name: string;
    region: string;
}>({
    id: null,
    name: 'Appwrite project',
    region: 'fra'
});

export const regions = writable<RegionList | undefined>(undefined);
