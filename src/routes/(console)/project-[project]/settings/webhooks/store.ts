// import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
// import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

// export const database = derived(page, ($page) => $page.data.database as Models.Database);
// export const showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Webhook ID', type: 'string', show: false, width: 200 },
    { id: 'name', title: 'Name', type: 'string', show: true, width: 200 },
    { id: 'url', title: 'Post URL', type: 'string', show: true, width: 200 },
    { id: 'events', title: 'Events', type: 'string', show: true, width: 120 },
    { id: 'enabled', title: 'Status', type: 'string', show: true, width: 180 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 200 },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', show: true, width: 200 }
]);
