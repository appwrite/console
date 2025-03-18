import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Webhook ID', type: 'string', hide: true, width: 150 },
    { id: 'name', title: 'Name', type: 'string', width: { min: 200 } },
    { id: 'url', title: 'Post URL', type: 'string', width: { min: 200 } },
    { id: 'events', title: 'Events', type: 'string', width: { min: 120 } },
    { id: 'enabled', title: 'Status', type: 'string', width: { min: 180 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 200 } },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 200 } }
]);
