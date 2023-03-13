import { writable } from 'svelte/store';

export type Column = {
    id: string;
    title: string;
    show: boolean;
    type?: string;
    direction?: string;
    width?: number;
};

export const columns = writable<Column[]>([]);
