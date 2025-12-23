import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { accumulateUsage } from '$lib/sdk/usage';
import { type Models, Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice: invoiceId, project, region } = params;
    const { organization } = await parent();

    let startDate: string = organization.billingCurrentInvoiceDate;
    let endDate: string = organization.billingNextInvoiceDate;
    let currentInvoice: Models.Invoice = undefined;
    let currentAggregation: Models.AggregationTeam = undefined;

    if (invoiceId) {
        currentInvoice = await sdk.forConsole.organizations.getInvoice({
            organizationId: organization.$id,
            invoiceId
        });
        currentAggregation = await sdk.forConsole.organizations.getAggregation({
            organizationId: organization.$id,
            aggregationId: currentInvoice.aggregationId
        });

        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    } else {
        try {
            currentAggregation = await sdk.forConsole.organizations.getAggregation({
                organizationId: organization.$id,
                aggregationId: organization.billingAggregationId
            });
        } catch (e) {
            // ignore error if no aggregation found
        }
    }

    const [invoices, usage] = await Promise.all([
        sdk.forConsole.organizations.listInvoices({
            organizationId: organization.$id,
            queries: [Query.orderDesc('from')]
        }),
        sdk.forProject(region, project).project.getUsage({ startDate, endDate })
    ]);

    if (currentAggregation) {
        let projectSpecificData: Models.AggregationBreakdown | null = null;
        if (currentAggregation.breakdown) {
            projectSpecificData = currentAggregation.breakdown.find((p) => p.$id === project);
        }

        if (projectSpecificData) {
            const executionsResource = projectSpecificData.resources?.find?.(
                (resource) => resource.resourceId === 'executions'
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
