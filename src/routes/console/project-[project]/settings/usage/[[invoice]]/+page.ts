import { getSdkForProject, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';
import type { Invoice } from '$lib/sdk/billing';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice, project } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;

    let startDate: string = org.billingCurrentInvoiceDate;
    let endDate: string = org.billingNextInvoiceDate;
    let currentInvoice: Invoice = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(org.$id, [Query.orderDesc('from')]),
        /**
         * Workaround because project id might not be populated yet.
         */
        getSdkForProject(project).project.getUsage(startDate, endDate)
    ]);

    return {
        usage,
        invoices,
        currentInvoice
    };
};
