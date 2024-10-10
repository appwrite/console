import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;

    /**
     * Temporary fix during migration to billing system
     */
    if (org.billingCurrentInvoiceDate === null || org.billingNextInvoiceDate === null) {
        return {
            organizationUsage: {
                bandwidth: null,
                users: null,
                usersTotal: null,
                storageTotal: null,
                filesStorageTotal: null,
                buildsStorageTotal: null,
                deploymentsStorageTotal: null,
                executions: null,
                executionsTotal: null,
                projects: null,
                executionsMBSecondsTotal: null,
                buildsMBSecondsTotal: null
            }
        };
    }

    let startDate: string = org.billingCurrentInvoiceDate;
    let endDate: string = org.billingNextInvoiceDate;
    let currentInvoice: Models.Invoice = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.organizations.getInvoice(org.$id, invoice);
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    }

    const [invoices, usage, organizationMembers] = await Promise.all([
        sdk.forConsole.organizations.listInvoices(org.$id, [Query.orderDesc('from')]),
        sdk.forConsole.organizations.getUsage(params.organization, startDate, endDate),
        sdk.forConsole.teams.listMemberships(params.organization)
    ]);

    const queries: string[] = [];

    if (usage?.projects?.length > 0) {
        queries.push(
            Query.equal(
                '$id',
                usage.projects.map((p) => p.projectId)
            )
        );
    }

    const projectNames = await sdk.forConsole.projects.list(queries);

    return {
        organizationUsage: usage,
        projectNames: projectNames.projects,
        invoices,
        currentInvoice,
        organizationMembers
    };
};
