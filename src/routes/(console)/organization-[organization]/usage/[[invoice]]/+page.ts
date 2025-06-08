import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { UsageProjectInfo } from '../../store';
import type { Invoice, OrganizationUsage } from '$lib/sdk/billing';
import { get } from 'svelte/store';
import { projects as projectsStore } from '../../store';

export const load: PageLoad = async ({ params, parent }) => {
    const { invoice } = params;
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

    const [usage, organizationMembers] = await Promise.all([
        sdk.forConsole.billing.listUsage(org.$id, startDate, endDate),
        // this section is cloud only,
        // so it is fine to use this check and fetch memberships conditionally!
        !plan?.addons?.seats?.supported
            ? null
            : sdk.forConsole.teams.listMemberships(org.$id, [Query.limit(100)])
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
function getUsageProjects(usage: OrganizationUsage) {
    return (async () => {
        const existing = get(projectsStore)?.projects ?? [];
        const projects: Record<string, UsageProjectInfo> = {};

        const storeIds = new Set<string>();
        for (const project of existing) {
            projects[project.$id] = {
                name: project.name,
                region: project.region
            };

            storeIds.add(project.$id);
        }

        // filter missing ones
        const toFetch = usage.projects.filter((p) => !storeIds.has(p.projectId));

        if (toFetch.length === 0) {
            return projects;
        }

        const limit = 100;
        const requests = [];
        for (let index = 0; index < toFetch.length; index += limit) {
            const chunkIds = toFetch.slice(index, index + limit).map((p) => p.projectId);
            requests.push(
                sdk.forConsole.projects.list([Query.limit(limit), Query.equal('$id', chunkIds)])
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
