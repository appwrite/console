import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';

export const user = derived(
    page,
    ($page) => $page.data.user as Models.User<Record<string, string>>
);
