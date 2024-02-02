import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export const showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Message ID', type: 'string', show: true, width: 140 },
    { id: 'message', title: 'Message', type: 'string', show: false, filter: false, width: 140 },
    { id: 'providerType', title: 'Type', type: 'string', show: true, width: 100 },
    { id: 'status', title: 'Status', type: 'string', show: true, width: 120 },
    { id: 'scheduledAt', title: 'Scheduled at', type: 'datetime', show: true, width: 120 },
    { id: 'deliveredAt', title: 'Delivered at', type: 'datetime', show: false, width: 120 }
]);

export const targetsById = writable<Record<string, Models.Target>>({});
export const topicsById = writable<Record<string, Models.Topic>>({});
