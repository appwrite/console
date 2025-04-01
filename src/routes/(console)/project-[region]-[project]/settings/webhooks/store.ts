// import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
// import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

// export const database = derived(page, ($page) => $page.data.database as Models.Database);
// export const showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Webhook ID', type: 'string', show: true, width: 150 },
    { id: 'name', title: 'Name', type: 'string', show: true, width: 120 },
    { id: 'url', title: 'Post URL', type: 'string', show: true, width: 120 },
    { id: 'events', title: 'Events', type: 'string', show: true, width: 60 },
    { id: 'enabled', title: 'Status', type: 'string', show: true, width: 150 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 120 },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', show: true, width: 120 }
]);
