import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const changeTierSteps = writable<WizardStepsType>(new Map());

export const changeOrganizationTier = writable<{
    id?: string;
    billingPlan: Tier;
    paymentMethodId: string;
    billingBudget?: number;
    collaborators?: string[];
}>({
    id: null,
    billingPlan: 'tier-1',
    paymentMethodId: null,
    collaborators: []
});
