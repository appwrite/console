import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';

export const user = derived(
    page,
    ($page) => $page.data.user as Models.User<Record<string, string>>
);
export const userFactors = derived(page, ($page) => $page.data.userFactors as Models.MfaFactors);
