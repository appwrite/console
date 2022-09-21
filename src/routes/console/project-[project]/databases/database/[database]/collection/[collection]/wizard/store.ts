import { writable } from 'svelte/store';
import type { Attributes } from '../store';

export const createDocument = writable<{
    id?: string;
    document: object;
    read: string[];
    write: string[];
    attributes: Attributes[];
}>({
    id: null,
    document: {},
    read: [],
    write: [],
    attributes: []
});
