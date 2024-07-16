import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import type { MfaFactors } from '$lib/sdk/account';

export const user = derived(
    page,
    ($page) => $page.data.user as Models.User<Record<string, string>>
);
export const userFactors = derived(page, ($page) => $page.data.userFactors as MfaFactors); // Replace with Models.MfaFactors once new SDK is released.
