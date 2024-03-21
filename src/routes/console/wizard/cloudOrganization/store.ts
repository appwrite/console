import { BillingPlan } from '$lib/constants';
import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Tier } from '$lib/stores/billing';
import { TRIAL_PERIOD_OVERRIDE } from '$lib/system';
import { writable } from 'svelte/store';

export const createOrgSteps = writable<WizardStepsType>(new Map());
export const createOrganizationFinalAction = writable<string>(
    TRIAL_PERIOD_OVERRIDE ? 'Create' : 'Start trial'
);

export const createOrganization = writable<{
    id?: string;
    name: string;
    billingPlan: Tier;
    paymentMethodId: string;
    billingAddressId: string;
    collaborators?: string[];
    billingBudget?: number;
    taxId?: string;
    couponCode?: string;
}>({
    id: null,
    name: null,
    billingPlan: BillingPlan.PRO,
    paymentMethodId: null,
    collaborators: [],
    billingAddressId: null,
    taxId: null,
    couponCode: null
});
