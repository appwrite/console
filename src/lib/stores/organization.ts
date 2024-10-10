import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { BillingPlan, Models } from '@appwrite.io/console';

export type Organization = Omit<
    Models.Organization<Record<string, unknown>>,
    'billingPlanDowngrade'
> & {
    billingPlan: BillingPlan;
    billingLimits: BillingLimits;
    billingPlanDowngrade: BillingPlan;
    budgetAlerts: number[];
};

export type OrganizationList = {
    teams: Organization[];
    total: number;
};

export type BillingLimits = {
    bandwidth: number;
    documents: number;
    executions: number;
    storage: number;
    users: number;
};

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);
export const organizationList = derived(
    page,
    ($page) => $page.data.organizations as Models.TeamList<Record<string, unknown>>
);
export const organization = derived(page, ($page) => $page.data?.organization as Organization);
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);
