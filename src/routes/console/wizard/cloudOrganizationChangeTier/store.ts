import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const changeTierSteps = writable<WizardStepsType>(new Map());
export const isUpgrade = writable<boolean>(false);
export const changeOrganizationFinalAction = writable<string>('Start trial');

export const changeOrganizationTier = writable<{
    id?: string;
    billingPlan: Tier;
    paymentMethodId: string;
    billingAddress: {
        address: null;
        address2: null;
        city: null;
        state: null;
        postalCode: null;
        country: null;
    };
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
}>({
    id: null,
    billingPlan: 'tier-1',
    paymentMethodId: null,
    collaborators: [],
    isOverLimit: false,
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
