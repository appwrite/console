import { writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';

export let showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Provider ID', type: 'string', show: true },
    { id: 'name', title: 'Name', type: 'string', show: true },
    { id: 'provider', title: 'Provider', type: 'string', show: true },
    { id: 'type', title: 'Type', type: 'string', show: true },
    { id: 'enabled', title: 'Status', type: 'boolean', show: true }
]);
