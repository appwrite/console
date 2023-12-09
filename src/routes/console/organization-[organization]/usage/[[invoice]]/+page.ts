import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';
import type { Invoice } from '$lib/sdk/billing';
import { getTomorrow } from '$lib/helpers/date';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;
    const tomorrow = getTomorrow(new Date());

    let startDate: string;
    let endDate: string;
    let currentInvoice: Invoice | null = null;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    } else {
        startDate = org.billingCurrentInvoiceDate;
        endDate = tomorrow.toISOString();
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(org.$id),
        sdk.forConsole.billing.listUsage(params.organization, startDate, endDate)
    ]);

    const projectNames = await sdk.forConsole.projects.list([
        Query.equal(
            '$id',
            usage.projects.map((p) => p.projectId)
        )
    ]);

    return {
        organizationUsage: usage,
        projectNames: projectNames.projects,
        invoices,
        currentInvoice
    };
};
