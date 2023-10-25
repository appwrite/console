import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Provider } from '../../store';

export const provider = derived(
    page,
    // TODO: Set actual type
    ($page) => $page.data.provider as Provider
);
