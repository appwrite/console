import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;
    const today = new Date().toISOString();
    let startDate: string;
    let endDate: string;

    if (invoice){
        const data = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        startDate = data.from;
        endDate = data.to;
    } else {
        startDate = org.billingCurrentInvoiceDate;
        endDate = today;
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(org.$id),
        sdk.forConsole.billing.listUsage(
            params.organization,
            startDate ?? org.billingCurrentInvoiceDate,
            endDate ?? today
        )
    ])

    return {
        organizationUsage: usage,
        invoices
    };
};
