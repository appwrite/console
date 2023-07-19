import { page } from '$app/stores';
import type { CreditList, InvoiceList, PaymentList } from '$lib/sdk/billing';
import { derived, type Readable } from 'svelte/store';

export const paymentMethods: Readable<PaymentList> = derived(
    page,
    ($page) => $page.data.paymentMethods
);
export const creditList: Readable<CreditList> = derived(page, ($page) => $page.data.creditList);
export const invoiceList: Readable<InvoiceList> = derived(page, ($page) => $page.data.invoiceList);
