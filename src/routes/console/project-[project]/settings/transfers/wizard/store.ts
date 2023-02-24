import { writable } from 'svelte/store';

export const createTransfer = writable<{
    id?: string;
    source: string;
    destination: string;
    resources: string[];
}>({
    id: null,
    source: null,
    destination: null,
    resources: []
});

export const createSource = writable<{
    id?: string;
    name: string;
    type: string;
    data: object;
}>({
    id: null,
    name: null,
    type: null,
    data: {}
});

export const createDestination = writable<{
    id?: string;
    name: string;
    type: string;
    data: object;
}>({
    id: null,
    name: null,
    type: null,
    data: {}
});
