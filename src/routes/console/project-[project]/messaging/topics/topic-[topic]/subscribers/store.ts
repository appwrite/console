import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Subscriber ID', type: 'string', show: true, width: 140 },
    { id: 'userName', title: 'Name', type: 'string', show: true, width: 100 },
    { id: 'targetId', title: 'Target ID', type: 'string', show: true, width: 140 },
    { id: 'target', title: 'Target', type: 'string', show: true, width: 140 },
    { id: 'type', title: 'Type', type: 'string', show: true, width: 80 },
    { id: '$createdAt', title: 'Created', type: 'string', show: true, width: 100 }
]);
