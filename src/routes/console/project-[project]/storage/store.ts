import type { Column } from '$lib/components/viewSelector.svelte';
import { toLocaleDateTime } from '$lib/helpers/date';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    {
        id: '$id',
        title: 'Bucket ID',
        show: true,
        width: 150
    },
    {
        id: 'name',
        title: 'Name',
        show: true,
        width: 120
    },
    {
        id: '$createdAt',
        title: 'Created',
        show: true,
        width: 120,
        transform: toLocaleDateTime
    },
    {
        id: '$updatedAt',
        title: 'Updated',
        show: true,
        width: 120,
        transform: toLocaleDateTime
    }
]);
