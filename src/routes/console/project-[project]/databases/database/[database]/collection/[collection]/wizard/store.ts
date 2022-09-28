import { writable } from 'svelte/store';
import type { Attributes } from '../store';

export const createDocument = writable<{
    id?: string;
    document: object;
    permissions: string[];
    attributes: Attributes[];
}>({
    id: null,
    document: {},
    permissions: [],
    attributes: []
});
