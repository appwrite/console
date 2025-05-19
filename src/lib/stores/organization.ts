import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { BillingPlan } from '$lib/constants';

export type OrganizationError = {
    status: number;
    message: string;
    teamId: string;
    invoiceId: string;
    clientSecret: string;
    type: string;
};

export type Organization = Omit<Models.Organization<Record<string, unknown>>, 'billingPlan'> & {
    billingPlan: BillingPlan;
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
    budgetLimit: number;
};

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);
export const organizationList = derived(
    page,
    ($page) => $page.data.organizations as Models.OrganizationList<Record<string, unknown>>
);

export const organization = derived(page, ($page) => $page.data?.organization as Organization);
export const currentPlan = derived(page, ($page) => $page.data?.currentPlan as Models.BillingPlan);
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);

export const regions = writable<Models.ConsoleRegionList | undefined>(undefined);
