import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Database ID', type: 'string', show: true, width: 150 },
    { id: 'name', title: 'Name', type: 'string', show: true, width: 120 },
    { id: '$createdAt', title: 'Created', type: 'string', show: true, width: 120 },
    { id: '$updatedAt', title: 'Updated', type: 'string', show: true, width: 120 }
]);
