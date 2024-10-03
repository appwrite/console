import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { Tier } from './billing';

export type Organization = Models.Team<Record<string, unknown>> & {
    billingBudget: number;
    billingPlan: Tier;
    budgetAlerts: number[];
    paymentMethodId: string;
    backupPaymentMethodId: string;
    markedForDeletion: boolean;
    billingLimits: BillingLimits;
    billingCurrentInvoiceDate: string;
    billingNextInvoiceDate: string;
    billingTrialStartDate?: string;
    billingStartDate?: string;
    billingTrialDays?: number;
    billingAddressId?: string;
    amount: number;
    billingTaxId?: string;
    billingPlanDowngrade?: Tier;
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

// TODO: remove override to tier-3 when BE PR, https://github.com/appwrite-labs/cloud/pull/816, has been merged and deployed -->
export const organization = derived(page, ($page) => {
    return { ...($page.data?.organization as Organization), billingPlan: 'tier-3' as Tier };
});
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);
