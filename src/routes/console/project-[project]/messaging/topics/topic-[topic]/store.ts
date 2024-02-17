import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const topic = derived(
    page,
    // TODO: Set actual type
    ($page) => $page.data.topic as Models.Topic
);
export const topicTotal = derived(
    topic,
    ($topic) => $topic.emailTotal + $topic.smsTotal + $topic.pushTotal
);
