import { writable } from 'svelte/store';

export const createProject = writable<{
    id?: string;
    name: string;
    region: string;
}>({
    id: null,
    name: null,
    region: 'fra'
});
