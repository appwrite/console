import { page } from '$app/stores';
import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';

export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as Models.AggregationTeamList
);

export const addCreditWizardSteps = writable<WizardStepsType>(new Map());
export const addCreditWizardStore = writable<{ coupon: string; paymentMethodId: string }>({
    coupon: null,
    paymentMethodId: null
});

export const selectedInvoice = writable<Models.Invoice>(null);
export const showRetryModal = writable(false);
