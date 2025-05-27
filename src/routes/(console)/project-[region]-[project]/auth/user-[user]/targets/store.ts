import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Target ID', type: 'string', width: 200 },
    { id: 'target', title: 'Target', type: 'string', filter: false, width: { min: 140 } },
    { id: 'providerType', title: 'Type', type: 'string', filter: true, width: { min: 80 } },
    { id: 'provider', title: 'Provider', type: 'string', filter: false, width: { min: 80 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 100 } }
]);
