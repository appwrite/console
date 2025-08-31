import type { AggregationTeam, Invoice } from '$lib/sdk/billing';
import { accumulateUsage } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice, project, region } = params;
    const { organization } = await parent();

    let startDate: string = organization.billingCurrentInvoiceDate;
    let endDate: string = organization.billingNextInvoiceDate;
    let currentInvoice: Invoice = undefined;
    let currentAggregation: AggregationTeam = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(organization.$id, invoice);
        currentAggregation = await sdk.forConsole.billing.getAggregation(
            organization.$id,
            currentInvoice.aggregationId
        );

        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    } else {
        try {
            currentAggregation = await sdk.forConsole.billing.getAggregation(
                organization.$id,
                organization.billingAggregationId
            );
        } catch (e) {
            // ignore error if no aggregation found
        }
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.billing.listInvoices(organization.$id, [Query.orderDesc('from')]),
        sdk.forProject(region, project).project.getUsage({ startDate, endDate })
    ]);

    if (currentAggregation) {
        let projectSpecificData = null;
        if (currentAggregation.breakdown) {
            projectSpecificData = currentAggregation.breakdown.find((p) => p.$id === project);
        }

        if (projectSpecificData) {
            const executionsResource = projectSpecificData.resources?.find?.(
                (r: any) => r.resourceId === 'executions'
            );
            if (executionsResource) {
                usage.executionsTotal = executionsResource.value || usage.executionsTotal;
            }
        } else {
            usage.usersTotal = currentAggregation.usageUsers;
            usage.executionsTotal = currentAggregation.usageExecutions;
            usage.filesStorageTotal = currentAggregation.usageStorage;
        }
    }

    usage.users = accumulateUsage(usage.users, usage.usersTotal);

    return {
        usage,
        invoices,
        currentInvoice,
        currentAggregation
    };
};
