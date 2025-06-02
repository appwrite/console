import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Database ID', type: 'string', width: 200 },
    { id: 'name', title: 'Name', type: 'string', width: 120 },
    { id: '$createdAt', title: 'Created', type: 'string', width: 120 },
    { id: '$updatedAt', title: 'Updated', type: 'string', width: 120 }
]);
