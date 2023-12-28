import { BillingPlan } from '$lib/constants';
import type { WizardStepsType } from '$lib/layout/wizard.svelte';
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
    collaborators?: string[];
    billingBudget?: number;
    taxId?: string;
}>({
    id: null,
    name: null,
    billingPlan: BillingPlan.PRO,
    paymentMethodId: null,
    collaborators: [],
    billingAddressId: null,
    taxId: null
});
