import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Address } from '$lib/sdk/billing';
import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const createOrgSteps = writable<WizardStepsType>(new Map());
export const createOrganizationFinalAction = writable<string>('Start trial');

export const createOrganization = writable<{
    id?: string;
    name: string;
    billingPlan: Tier;
    paymentMethodId: string;
    billingAddressId: string;
    billingAddress?: Address;
    collaborators?: string[];
    billingBudget?: number;
    taxId?: string;
}>({
    id: null,
    name: null,
    billingPlan: 'tier-1',
    paymentMethodId: null,
    collaborators: [],
    billingAddressId: null,
    billingAddress: {
        $id: null,
        streetAddress: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null
    },
    taxId: null
});
