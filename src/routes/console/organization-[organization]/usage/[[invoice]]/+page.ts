import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';
import type { Invoice } from '$lib/sdk/billing';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;
    const today = new Date().toISOString();
    let startDate: string;
    let endDate: string;
    let currentInvoice: Invoice | null = null;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    } else {
        startDate = org.billingCurrentInvoiceDate;
        endDate = today;
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(org.$id),
        sdk.forConsole.billing.listUsage(params.organization, startDate, endDate)
    ]);

    return {
        organizationUsage: usage,
        invoices,
        currentInvoice
    };
};
