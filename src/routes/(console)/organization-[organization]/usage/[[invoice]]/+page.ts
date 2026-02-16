import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { type Models, Query } from '@appwrite.io/console';
import type { UsageProjectInfo } from '../../store';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice: invoiceId } = params;
    const { organization: org, currentPlan: plan } = await parent();

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
                imageTransformationsTotal: null,
                screenshotsGenerated: null,
                screenshotsGeneratedTotal: null
            }
        };
    }

    let startDate: string = org.billingCurrentInvoiceDate;
    let endDate: string = org.billingNextInvoiceDate;
    let currentInvoice: Models.Invoice = undefined;

    if (invoiceId) {
        currentInvoice = await sdk.forConsole.organizations.getInvoice({
            organizationId: org.$id,
            invoiceId
        });
        startDate = currentInvoice.from;
        endDate = currentInvoice.to;
    }

    const [usage, organizationMembers] = await Promise.all([
        sdk.forConsole.organizations.getUsage({
            organizationId: org.$id,
            startDate,
            endDate
        }),

        // this section is cloud only,
        // so it is fine to use this check and fetch memberships conditionally!
        !plan?.addons?.seats?.supported
            ? null
            : sdk.forConsole.teams.listMemberships({ teamId: org.$id, queries: [Query.limit(100)] })
    ]);

    return {
        plan,
        currentInvoice,
        organizationMembers,
        organizationUsage: usage,
        projects: getUsageProjects(usage)
    };
};

// all this to get the project's name and region!
function getUsageProjects(usage: Models.UsageOrganization) {
    return (async () => {
        const limit = 100;
        const requests: Array<Promise<Models.ProjectList>> = [];
        const projects: Record<string, UsageProjectInfo> = {};
        for (let index = 0; index < usage.projects.length; index += limit) {
            const chunkIds = usage.projects.slice(index, index + limit).map((p) => p.projectId);
            requests.push(
                sdk.forConsole.projects.list({
                    queries: [
                        Query.limit(limit),
                        Query.equal('$id', chunkIds),
                        Query.select(['$id', 'name', 'region'])
                    ]
                })
            );
        }

        const responses = await Promise.all(requests);
        for (const response of responses) {
            for (const project of response.projects) {
                projects[project.$id] = {
                    name: project.name,
                    region: project.region
                };
            }
        }

        return projects;
    })();
}
