import { page } from '$app/stores';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { derived, writable } from 'svelte/store';
import { type Models, Platform, Query } from '@appwrite.io/console';

export type OrganizationError = {
    status: number;
    message: string;
    teamId: string;
    invoiceId: string;
    clientSecret: string;
    type: string;
};

// TODO: @itznotabug - check with @abnegate, what do we do here? this is billing!
export type BillingLimits = {
    bandwidth: number;
    documents: number;
    executions: number;
    storage: number;
    users: number;
    budgetLimit: number;
};

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);
export const organizationList = derived(
    page,
    ($page) => $page.data.organizations as Models.TeamList<Record<string, unknown>>
);

export const organization = derived(
    page,
    ($page) => $page.data?.organization as Models.Organization
);
export const currentPlan = derived(page, ($page) => $page.data?.currentPlan as Models.BillingPlan);
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);
export const regions = writable<Models.ConsoleRegionList>({ total: 0, regions: [] });

export async function getTeamOrOrganizationList(
    queries: string[] = []
): Models.TeamList | Models.OrganizationList {
    let organizations: Models.TeamList | Models.OrganizationList;

    if (isCloud) {
        organizations = await sdk.forConsole.organizations.list({
            queries: [...queries, Query.equal('platform', Platform.Appwrite)]
        });
    } else {
        organizations = await sdk.forConsole.teams.list({ queries });
    }

    return organizations;
}
