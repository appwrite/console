import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const database = derived(page, ($page) => $page.data.database as Models.Database);
export const showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Collection ID', type: 'string', show: true, width: 150 },
    { id: 'name', title: 'Name', type: 'string', show: true, width: 120 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 120 },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', show: true, width: 120 }
]);

export const backupRetainingOptions = [
    { label: '3 Days', value: 3 },
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '1 Month', value: 30 },
    { label: '3 Months', value: 90 },
    { label: '1 Year', value: 365 },
    { label: 'Forever', value: 365 * 100 }
];
