import type { Aggregation, Invoice } from '$lib/sdk/billing';
import { accumulateUsage } from '$lib/sdk/usage';
import { getSdkForProject, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice, project } = params;
    const { organization } = await parent();

    let startDate: string = organization.billingCurrentInvoiceDate;
    let endDate: string = organization.billingNextInvoiceDate;
    let currentInvoice: Invoice = undefined;
    let currentAggregation: Aggregation = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(organization.$id, invoice);
        currentAggregation = await sdk.forConsole.billing.getAggregation(
            organization.$id,
            currentInvoice.aggregationId
        );

        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(organization.$id, [Query.orderDesc('from')]),
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
