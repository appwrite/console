import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Target ID', type: 'string', show: true, width: 140 },
    { id: 'target', title: 'Target', type: 'string', show: true, filter: false, width: 140 },
    { id: 'providerType', title: 'Type', type: 'string', show: true, filter: true, width: 80 },
    { id: 'provider', title: 'Provider', type: 'string', show: true, filter: false, width: 80 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 100 }
]);
