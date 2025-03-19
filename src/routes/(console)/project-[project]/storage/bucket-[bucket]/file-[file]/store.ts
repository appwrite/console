import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import type { Column } from '$lib/helpers/types';

export const file = derived(page, ($page) => $page.data.file as Models.File);

export const columns = writable<Column[]>([
    { id: 'created', title: 'Created', type: 'datetime', width: 170 },
    { id: 'value', title: 'Value', type: 'string', width: 170 },
    { id: 'expiry', title: 'Expiry', type: 'datetime', width: 170 },
    { id: 'last_accessed', title: 'Last accessed', type: 'datetime', width: 170 },
    { id: 'actions', title: '', type: 'string', width: 80 }
]);
