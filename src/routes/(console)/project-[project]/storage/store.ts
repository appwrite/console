import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Bucket ID', type: 'string', width: 150 },
    { id: 'name', title: 'Name', type: 'string', width: { min: 120 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 120 } }
]);
