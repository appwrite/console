import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const domain = derived(page, ($page) => $page.data.domain as Models.ProxyRule);
// columns: namem type, value, ttl, priority, comment, created
export const columns = writable<Column[]>([
    { id: 'name', title: 'Name', type: 'string', show: true },
    { id: 'type', title: 'Type', type: 'string', show: true },
    { id: 'value', title: 'Value', type: 'string', show: true },
    { id: 'ttl', title: 'TTL', type: 'integer', show: true },
    { id: 'priority', title: 'Priority', type: 'integer', show: false },
    { id: 'comment', title: 'Comment', type: 'string', show: false },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true }
]);
