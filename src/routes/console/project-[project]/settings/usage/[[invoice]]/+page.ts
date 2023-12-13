import { getSdkForProject, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';
import type { Aggregation, Invoice } from '$lib/sdk/billing';
import { accumulateUsage } from '$lib/sdk/usage';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice, project } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;

    let startDate: string = org.billingCurrentInvoiceDate;
    let endDate: string = org.billingNextInvoiceDate;
    let currentInvoice: Invoice = undefined;
    let currentAggregation: Aggregation = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        currentAggregation = await sdk.forConsole.billing.getAggregation(
            org.$id,
            currentInvoice.aggregationId
        );

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

    if (invoice) {
        usage.usersTotal = currentAggregation.usageUsers;
        usage.executionsTotal = currentAggregation.usageExecutions;
        usage.filesStorageTotal = currentAggregation.usageStorage;
    }

    usage.users = accumulateUsage(usage.users, usage.usersTotal);

    return {
        usage,
        invoices,
        currentInvoice,
        currentAggregation
    };
};
