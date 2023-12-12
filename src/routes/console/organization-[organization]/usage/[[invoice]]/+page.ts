import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';
import type { Invoice } from '$lib/sdk/billing';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;

    let startDate: string = undefined;
    let endDate: string = undefined;
    let currentInvoice: Invoice = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(org.$id, [Query.orderDesc('from')]),
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
