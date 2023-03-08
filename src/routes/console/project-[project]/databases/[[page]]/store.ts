import { writable } from 'svelte/store';

export type Column = {
    id: string;
    title: string;
    show: boolean;
    width?: number;
};

export const columns = writable<Column[]>([
    { id: '$id', title: 'Database ID', show: true, width: 50 },
    { id: 'name', title: 'Name', show: true, width: 120 },
    { id: '$createdAt', title: 'Created', show: true, width: 120 },
    { id: '$updatedAt', title: 'Updated', show: true, width: 120 }
]);
