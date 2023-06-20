import { Tier } from '$lib/system';
import { writable } from 'svelte/store';

export type Collborator = {
    email: string;
    role: string;
};

export const createOrganization = writable<{
    id?: string;
    name: string;
    tier: Tier;
    payment: string;
    budget?: number;
    collaborators?: Collborator[];
}>({
    id: null,
    name: null,
    tier: Tier['PRO'],
    payment: null,
    collaborators: []
});
