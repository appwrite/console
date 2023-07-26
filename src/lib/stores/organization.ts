import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export type Organization = Models.Team<Record<string, unknown>> & {
    billingBudget: number;
    billingPlan: string;
    budgetAlerts: number[];
    paymentMethodId: string;
    backupPaymentMethodId: string;
    billingCurrentInvoiceDate: string;
    billingNextInvoiceDate: string;
    billingTrialStartDate?: string;
    billingTrialDays?: number;
};

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);
export const organizationList = derived(
    page,
    ($page) => $page.data.organizations as Models.TeamList<Record<string, unknown>>
);
export const organization = derived(page, ($page) => $page.data?.organization as Organization);
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);
