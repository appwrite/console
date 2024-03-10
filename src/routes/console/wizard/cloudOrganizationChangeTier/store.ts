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
    feedbackDowngradeReason?: string;
    couponCode?: string;
}>({
    billingPlan: BillingPlan.PRO,
    paymentMethodId: null,
    collaborators: [],
    isOverLimit: false,
    billingAddressId: null,
    taxId: null
});

export const feedbackDowngradeOptions = [
    {
        value: 'availableFeatures',
        label: "The available features don't meet my needs"
    },
    {
        value: 'traction',
        label: "My project isn't getting traction"
    },
    {
        value: 'bugs',
        label: 'I experienced bugs or unexpected outages while using the console'
    },
    {
        value: 'starter',
        label: 'The Starter plan is enough for my projects'
    },
    {
        value: 'budget',
        label: "I don't have the budget"
    },
    {
        value: 'tryOut',
        label: 'I just wanted to try it out'
    },
    {
        value: 'alternative',
        label: 'I found an alternative/competitor to meet my needs'
    },
    {
        value: 'other',
        label: 'Other'
    }
];
