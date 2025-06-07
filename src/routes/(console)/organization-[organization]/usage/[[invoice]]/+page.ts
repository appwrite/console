import { type Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { UsageProjectInfo } from '../../store';
import type { Invoice, OrganizationUsage } from '$lib/sdk/billing';

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
                backupsStorageTotal: null,
                executions: null,
                executionsTotal: null,
                projects: null,
                executionsMBSecondsTotal: null,
                buildsMBSecondsTotal: null,
                authPhoneTotal: null,
                authPhoneEstimate: null,
                databasesReads: null,
                databasesWrites: null,
                databasesReadsTotal: null,
                databasesWritesTotal: null,
                imageTransformations: null,
                imageTransformationsTotal: null
            }
        };
    }

    let startDate: string = org.billingCurrentInvoiceDate;
    let endDate: string = org.billingNextInvoiceDate;
    let currentInvoice: Invoice = undefined;

    if (invoice) {
        currentInvoice = await sdk.forConsole.billing.getInvoice(org.$id, invoice);
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    }

    const [invoices, usage, organizationMembers, plan] = await Promise.all([
        sdk.forConsole.billing.listInvoices(org.$id, [Query.orderDesc('from')]),
        sdk.forConsole.billing.listUsage(params.organization, startDate, endDate),
        sdk.forConsole.teams.listMemberships(params.organization, [Query.limit(100)]),
        sdk.forConsole.billing.getOrganizationPlan(org.$id)
    ]);

    return {
        plan,
        invoices,
        currentInvoice,
        organizationMembers,
        organizationUsage: usage,
        projectsPromise: getUsageProjectsPromise(usage)
    };
};

// all this to get the project's name and region!
function getUsageProjectsPromise(usage: OrganizationUsage) {
    return (async () => {
        const projects: { [key: string]: UsageProjectInfo } = {};

        if (usage?.projects?.length > 0) {
            const chunk = 100;
            const requests = [];
            for (let i = 0; i < usage.projects.length; i += chunk) {
                const queries = [
                    Query.limit(chunk),
                    Query.equal(
                        '$id',
                        usage.projects.slice(i, i + chunk).map((p) => p.projectId)
                    )
                ];

                // this returns too much of data that we don't need!
                requests.push(sdk.forConsole.projects.list(queries));
            }

            const responses = await Promise.all(requests);
            for (const response of responses) {
                for (const project of response.projects) {
                    projects[project.$id] = {
                        $id: project.$id,
                        name: project.name,
                        region: project.region
                    };
                }
            }
        }

        return projects;
    })();
}
