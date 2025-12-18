import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { AggregationList, InvoiceUsage } from '$lib/sdk/billing';
import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';

export const aggregationList = derived(
    page,
    ($page) => $page.data.aggregationList as AggregationList
);

export const addCreditWizardSteps = writable<WizardStepsType>(new Map());
export const addCreditWizardStore = writable<{ coupon: string; paymentMethodId: string }>({
    coupon: null,
    paymentMethodId: null
});

export const selectedInvoice = writable<Models.Invoice>(null);
export const showRetryModal = writable(false);

export type RowFactoryOptions = {
    id: string;
    label: string;
    resource?: InvoiceUsage;
    planLimit?: number | null;
    includeProgress?: boolean;
    formatValue?: (value: number | null | undefined) => string;
    usageFormatter?: (options: {
        value: number;
        planLimit?: number | null;
        resource?: InvoiceUsage;
        formatValue: (value: number | null | undefined) => string;
        hasLimit: boolean;
    }) => string;
    priceFormatter?: (options: { amount: number; resource?: InvoiceUsage }) => string;
    progressFactory?: (options: {
        value: number;
        planLimit?: number | null;
        resource?: InvoiceUsage;
        hasLimit: boolean;
    }) => Array<{ size: number; color: string; tooltip?: { title: string; label: string } }>;
    maxFactory?: (options: {
        planLimit?: number | null;
        hasLimit: boolean;
        resource?: InvoiceUsage;
    }) => number | null;
};
