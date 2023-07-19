import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const createOrganization = writable<{
    id?: string;
    name: string;
    billingPlan: Tier;
    paymentMethodId: string;
    billingBudget?: number;
    collaborators?: string[];
}>({
    id: null,
    name: null,
    billingPlan: 'tier-1',
    paymentMethodId: null,
    collaborators: []
});
