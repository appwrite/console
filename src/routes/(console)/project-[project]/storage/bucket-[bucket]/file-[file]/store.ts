import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import type { Column } from '$lib/helpers/types';

export const file = derived(page, ($page) => $page.data.file as Models.File);

export const tokens = derived(page, ($page) => $page.data.tokens as Models.ResourceTokenList & {
    accessedAt: string,
});

export const columns = writable<Column[]>([
    { id: 'created', title: 'Created', type: 'datetime', width: 200 },
    { id: 'expiry', title: 'Expiration date', type: 'datetime', width: 200 },
    { id: 'last_accessed', title: 'Last accessed', type: 'datetime', width: 200 },
    { id: 'actions', title: '', type: 'string'}
]);
