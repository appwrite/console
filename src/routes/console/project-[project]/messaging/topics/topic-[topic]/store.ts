import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import type { Column } from '$lib/helpers/types';

export const topic = derived(
    page,
    // TODO: Set actual type
    ($page) => $page.data.topic as Models.Topic
);
export const topicTotal = derived(
    topic,
    ($topic) => $topic.emailTotal + $topic.smsTotal + $topic.pushTotal
);
export const columns = writable<Column[]>([
    { id: '$id', title: 'Subscriber ID', type: 'string', show: true, width: 140 },
    { id: 'userName', title: 'Name', type: 'string', show: true, filter: false, width: 100 },
    { id: 'targetId', title: 'Target ID', type: 'string', show: true, width: 140 },
    { id: 'target', title: 'Target', type: 'string', show: true, filter: false, width: 140 },
    { id: 'type', title: 'Type', type: 'string', show: true, width: 80 },
    { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 100 }
]);