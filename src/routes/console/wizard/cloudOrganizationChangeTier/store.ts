import { BillingPlan } from '$lib/constants';
import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const changeTierSteps = writable<WizardStepsType>(new Map());
export const isUpgrade = writable<boolean>(false);
export const changeOrganizationFinalAction = writable<string>('Start trial');

export const changeOrganizationTier = writable<{
    billingPlan: Tier;
    paymentMethodId: string;
    billingAddressId: string;
    billingBudget?: number;
    collaborators?: string[];
    isOverLimit?: boolean;
    limitOverflow?: {
        bandwidth?: number;
        executions?: number;
        storage?: number;
        users?: number;
        members?: number;
    };
    taxId?: string;
    feedbackMessage?: string;
    couponCode?: string;
}>({
    billingPlan: BillingPlan.PRO,
    paymentMethodId: null,
    collaborators: [],
    isOverLimit: false,
    billingAddressId: null,
    taxId: null
});
