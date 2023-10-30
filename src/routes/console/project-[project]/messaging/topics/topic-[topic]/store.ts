import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Topic } from '../+page';

export const topic = derived(
    page,
    // TODO: Set actual type
    ($page) => $page.data.topic as Topic
);
