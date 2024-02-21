import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Topic ID', type: 'string', show: true, width: 140 },
    { id: 'name', title: 'Name', type: 'string', show: true, width: 140 },
    { id: 'emailTotal', title: 'Email Subscribers', type: 'integer', show: false, width: 140 },
    { id: 'smsTotal', title: 'SMS Subscribers', type: 'integer', show: false, width: 140 },
    { id: 'pushTotal', title: 'Push Subscribers', type: 'integer', show: false, width: 140 },
    { id: 'total', title: 'Subscribers', type: 'integer', show: true, filter: false, width: 140 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 140 }
]);
