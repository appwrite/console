import { page } from '$app/stores';
import { derived, get, writable } from 'svelte/store';
import { sdk } from './sdk';
import { organization, type Organization } from './organization';
import type { InvoiceList, AddressesList, Invoice, PaymentList, PlansInfo } from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { cachedStore } from '$lib/helpers/cache';
import { Query, type Models } from '@appwrite.io/console';
import { headerAlert } from './headerAlert';
import PaymentAuthRequired from '$lib/components/billing/alerts/paymentAuthRequired.svelte';
import { diffDays, toLocaleDate } from '$lib/helpers/date';
import { addNotification, notifications } from './notifications';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import TooManyFreOrgs from '$lib/components/billing/alerts/tooManyFreeOrgs.svelte';
import { activeHeaderAlert, showPostReleaseModal } from '$routes/console/store';
import MarkedForDeletion from '$lib/components/billing/alerts/markedForDeletion.svelte';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const plansInfo = derived(page, ($page) => $page.data.plansInfo as PlansInfo);
export const daysLeftInTrial = writable<number>(0);
export const readOnly = writable<boolean>(false);

export function tierToPlan(tier: Tier) {
    switch (tier) {
        case 'tier-0':
            return tierFree;
        case 'tier-1':
            return tierPro;
        case 'tier-2':
            return tierScale;
        default:
            return tierFree;
    }
}

export type PlanServices =
    | 'bandwidth'
    | 'bandwidthAddon'
    | 'buckets'
    | 'databases'
    | 'executions'
    | 'executionsAddon'
    | 'fileSize'
    | 'functions'
    | 'logs'
    | 'memberAddon'
    | 'members'
    | 'platforms'
    | 'realtime'
    | 'realtimeAddon'
    | 'storage'
    | 'storageAddon'
    | 'teams'
    | 'users'
    | 'usersAddon'
    | 'webhooks';

export function getServiceLimit(serviceId: PlanServices, tier: Tier = null): number {
    if (!isCloud) return 0;
    if (!serviceId) return 0;
    const info = get(plansInfo);
    if (!info?.plans) return 0;
    const plan = info.plans.find((p) => p.$id === (tier ?? get(organization)?.billingPlan));
    return plan?.[serviceId];
}

export const failedInvoice = cachedStore<
    false | Invoice,
    {
        load: (orgId: string) => Promise<void>;
    }
>('failedInvoice', function ({ set }) {
    return {
        load: async (orgId) => {
            if (!isCloud) set(false);
            const invoices = await sdk.forConsole.billing.listInvoices(orgId);
            const failedInvoices = invoices.invoices.filter((i) => i.status === 'failed');
            // const failedInvoices = invoices.invoices;
            if (failedInvoices.length > 0) {
                const firstFailed = failedInvoices[0];
                const today = new Date();
                const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
                const failedDate = new Date(firstFailed.$createdAt);
                if (failedDate < thirtyDaysAgo) {
                    readOnly.set(true);
                }
            } else set(false);
        }
    };
});

export const actionRequiredInvoices = writable<InvoiceList>(null);

export type TierData = {
    name: string;
    description: string;
};

export const tierFree: TierData = {
    name: 'Starter',
    description: 'For personal, passion projects.'
};

export const tierPro: TierData = {
    name: 'Pro',
    description: 'For pro developers and production projects that need the ability to scale.'
};
export const tierScale: TierData = {
    name: 'Scale',
    description: 'For scaling teams that need dedicated support.'
};

export const showUsageRatesModal = writable<boolean>(false);

export function checkForUsageFees(plan: Tier, id: PlanServices) {
    if (plan === 'tier-1' || plan === 'tier-2') {
        switch (id) {
            case 'bandwidth':
            case 'storage':
            case 'users':
            case 'executions':
            case 'realtime':
                return true;

            default:
                return false;
        }
    } else return false;
}

export function checkForProjectLimitation(id: PlanServices) {
    switch (id) {
        case 'databases':
        case 'functions':
        case 'buckets':
        case 'members':
        case 'platforms':
        case 'webhooks':
        case 'teams':
            return true;

        default:
            return false;
    }
}

export function isServiceLimited(serviceId: PlanServices, plan: Tier, total: number) {
    if (!total) return false;
    const limit = getServiceLimit(serviceId) || Infinity;
    const isLimited = limit !== 0 && limit < Infinity;
    const hasUsageFees = checkForUsageFees(plan, serviceId);
    return isLimited && total >= limit && !hasUsageFees;
}

export function calculateTrialDay(org: Organization) {
    if (org?.billingPlan === 'tier-0') return false;
    const endDate = new Date(org?.billingTrialEndDate);
    const today = new Date();
    const days = diffDays(today, endDate);
    daysLeftInTrial.set(days);
    return days;
}

export function checkForTrialEnding(org: Organization) {
    const days = calculateTrialDay(org);
    if (localStorage.getItem('trialEndingNotification') === 'true' || !days) return;
    else if (days <= 5) {
        addNotification({
            type: 'info',
            isHtml: true,
            message: `<b>We hope you've been enjoying the ${
                tierToPlan(org.billingPlan).name
            } plan.</b>
                You will be billed on a recurring 30-day cycle after your trial period ends on <b>${toLocaleDate(
                    org.billingTrialEndDate
                )}</b>`
        });
        localStorage.setItem('trialEndingNotification', 'true');
    }
}

export function checkForUsageLimit(org: Organization) {
    if (!org?.billingLimits) {
        readOnly.set(false);
        return;
    }
    const { bandwidth, documents, executions, storage, users } = org.billingLimits;
    if (
        bandwidth >= 100 ||
        documents >= 100 ||
        executions >= 100 ||
        storage >= 100 ||
        users >= 100
    ) {
        readOnly.set(true);
    } else readOnly.set(false);
}

export async function checkPaymentAuthorizationRequired(org: Organization) {
    if (org.billingPlan === 'tier-0') return;

    const invoices = await sdk.forConsole.billing.listInvoices(org.$id, [
        Query.equal('status', 'requires_authentication')
    ]);

    if (invoices?.invoices?.length > 0) {
        headerAlert.add({
            id: 'paymentAuthRequired',
            component: PaymentAuthRequired,
            show: true,
            importance: 8
        });
    }
    activeHeaderAlert.set(headerAlert.get());

    actionRequiredInvoices.set(invoices);
}

export async function paymentExpired(org: Organization) {
    if (!org?.paymentMethodId) return;
    const payment = await sdk.forConsole.billing.getPaymentMethod(org.paymentMethodId);
    if (!payment?.expiryYear) return;
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const expiredMessage = `The default payment method for <b>${org.name}</b> has expired`;
    const expiringMessage = `The default payment method for <b>${org.name}</b> will expire soon`;
    const nots = get(notifications);
    const expiredNotification = nots.some((n) => n.message === expiredMessage);
    const expiringNotification = nots.some((n) => n.message === expiringMessage);
    if (payment.expired && !expiredNotification) {
        addNotification({
            type: 'error',
            isHtml: true,
            timeout: 0,
            message: expiredMessage,
            buttons: [
                {
                    name: 'Update payment details',
                    method: () => {
                        goto(`${base}/console/account/payments`);
                    }
                }
            ]
        });
    } else if (!expiringNotification && payment.expiryYear <= year && payment.expiryMonth < month) {
        addNotification({
            type: 'warning',
            isHtml: true,
            message: expiringMessage,
            buttons: [
                {
                    name: 'Update payment details',
                    method: () => {
                        goto(`${base}/console/account/payments`);
                    }
                }
            ]
        });
    }
}

export function checkForMarkedForDeletion(org: Organization) {
    if (org?.markedForDeletion) {
        headerAlert.add({
            id: 'markedForDeletion',
            component: MarkedForDeletion,
            show: true,
            importance: 5
        });
    }
}

export async function checkForFreeOrgOverflow(orgs: Models.TeamList<Record<string, unknown>>) {
    if (orgs?.teams?.length > 1) {
        headerAlert.add({
            id: 'freeOrgOverflow',
            component: TooManyFreOrgs,
            show: true,
            importance: 10
        });
    }
}

export async function checkForPostReleaseProModal(orgs: Models.TeamList<Record<string, unknown>>) {
    if (!orgs?.teams?.length) return;
    const modalTime = localStorage.getItem('postReleaseProModal');
    const now = Date.now();
    // show the modal if it was never shown
    if (!modalTime) {
        localStorage.setItem('postReleaseProModal', Date.now().toString());
        showPostReleaseModal.set(true);
    } else {
        const interval = 5 * 24 * 60 * 60 * 1000;
        const sinceLastModal = now - parseInt(modalTime);
        // show the modal if it was shown more than 5 days ago
        if (sinceLastModal > interval) {
            localStorage.setItem('postReleaseProModal', Date.now().toString());
            showPostReleaseModal.set(true);
        }
    }
}
