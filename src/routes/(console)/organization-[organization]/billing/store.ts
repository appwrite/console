import { page } from '$app/stores';
import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { AggregationList, Invoice } from '$lib/sdk/billing';
import { derived, writable } from 'svelte/store';

export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as AggregationList
);

export const addCreditWizardSteps = writable<WizardStepsType>(new Map());
export const addCreditWizardStore = writable<{ coupon: string; paymentMethodId: string }>({
    coupon: null,
    paymentMethodId: null
});

export const selectedInvoice = writable<Invoice>(null);
export const showRetryModal = writable(false);

export const scrollToUpdateBudget = derived(page, ($page) =>
    $page.url.hash.includes('#update-budget')
);
