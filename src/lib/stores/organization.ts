import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';
import type { Tier } from './billing';

export type OrganizationError = {
    status: number;
    message: string;
    teamId: string;
    invoiceId: string;
    clientSecret: string;
    type: string;
};

export type Organization = Models.Team<Record<string, unknown>> & {
    billingBudget: number;
    billingPlan: Tier;
    budgetAlerts: number[];
    paymentMethodId: string;
    backupPaymentMethodId: string;
    markedForDeletion: boolean;
    billingLimits: Models.BillingLimits;
    billingCurrentInvoiceDate: string;
    billingNextInvoiceDate: string;
    billingTrialStartDate?: string;
    billingStartDate?: string;
    billingTrialDays?: number;
    billingAddressId?: string;
    billingTaxId?: string;
    billingPlanDowngrade?: Tier;
    billingAggregationId: string;
    billingInvoiceId: string;
};

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);
export const organizationList = derived(
    page,
    ($page) => $page.data.organizations as Models.TeamList<Record<string, unknown>>
);

export const organization = derived(page, ($page) => $page.data?.organization as Organization);
export const currentPlan = derived(page, ($page) => $page.data?.currentPlan as Models.BillingPlan);
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);
