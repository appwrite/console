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
