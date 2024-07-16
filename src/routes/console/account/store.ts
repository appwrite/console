import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { MfaFactors } from '$lib/sdk/account';

export const factors = derived(
    page,
    ($page) => $page.data.factors as MfaFactors & { recoveryCode: boolean } // Replace with Models.MfaFactors once new SDK is released.
);
export const identities = derived(
    page,
    ($page) => $page.data.identities.identities as Models.Identity[]
);
