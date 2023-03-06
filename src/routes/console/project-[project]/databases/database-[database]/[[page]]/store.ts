import { writable } from 'svelte/store';

export type Column = {
    id: string;
    name: string;
    show: boolean;
    width?: number;
};

export const columns = writable<Column[]>([
    { id: '$id', name: 'Database ID', show: true, width: 50 },
    { id: 'name', name: 'Name', show: true, width: 120 },
    { id: '$createdAt', name: 'Created', show: true, width: 120 },
    { id: '$updatedAt', name: 'Updated', show: true, width: 120 }
]);
