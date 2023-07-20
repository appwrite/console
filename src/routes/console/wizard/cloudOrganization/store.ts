import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Tier } from '$lib/stores/billing';
import { writable } from 'svelte/store';

export const stepsComponents = writable<WizardStepsType>(new Map());

export function updateComponentStatus(map: WizardStepsType, key: number, status: boolean) {
    const updatedComponent = {
        ...map.get(key),
        disabled: status
    };
    map.set(key, updatedComponent);
    return map;
}

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
