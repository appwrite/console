import { getSdkForProject, sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

function accumulateUsage(usage: Models.Metric[], base: number): Models.Metric[] {
    const accumulation = usage.reduce(
        (carry, item) => {
            const value = item.value + carry.currentTotal;
            return {
                currentTotal: value,
                metrics: [...carry.metrics, { ...item, value }]
            };
        },
        {
            currentTotal: base,
            metrics: []
        }
    );

    return accumulation.metrics;
}

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice, project } = params;
    const { organization } = await parent();

    let startDate: string = organization.billingCurrentInvoiceDate;
    let endDate: string = organization.billingNextInvoiceDate;
    let currentInvoice: Models.Invoice = undefined;
    let currentAggregation: Models.AggregationTeam = undefined;

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
