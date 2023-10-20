import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export let showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Topic ID', type: 'string', show: true, width: 140 },
    { id: 'name', title: 'Name', type: 'string', show: true, width: 140 },
    { id: 'total', title: 'Subscribers', type: 'integer', show: true, width: 140 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 140 }
]);
