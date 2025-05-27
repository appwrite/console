import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const userList = derived(
    page,
    ($page) => $page.data.users as unknown as Models.UserList<Record<string, unknown>>
);
