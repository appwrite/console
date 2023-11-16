import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const createOrgSteps = writable<WizardStepsType>(new Map());

export const createOrganization = writable<{
    id?: string;
    name: string;
    billingPlan: Tier;
    paymentMethodId: string;
    billingAddress: {
        address: string;
        address2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    collaborators?: string[];
    billingBudget?: number;
    taxId?: string;
}>({
    id: null,
    name: null,
    billingPlan: 'tier-1',
    paymentMethodId: null,
    collaborators: [],
    billingAddress: {
        address: null,
        address2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null
    },
    taxId: null
});
