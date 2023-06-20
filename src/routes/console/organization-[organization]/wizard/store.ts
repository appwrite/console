import { Tier } from '$lib/system';
import { writable } from 'svelte/store';

export const createProject = writable<{
    id?: string;
    name: string;
    tier: Tier;
    region: string;
}>({
    id: null,
    name: null,
    tier: Tier['PRO'],
    region: 'eu-central-1'
});
