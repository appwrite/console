import { page } from '$app/stores';
import { derived, get, writable } from 'svelte/store';
import { sdk } from './sdk';
import { organization, type Organization } from './organization';
import type {
    InvoiceList,
    AddressesList,
    Invoice,
    PaymentList,
    PlansMap,
    PaymentMethodData
} from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { cachedStore } from '$lib/helpers/cache';
import { Query } from '@appwrite.io/console';
import { headerAlert } from './headerAlert';
import PaymentAuthRequired from '$lib/components/billing/alerts/paymentAuthRequired.svelte';
import { addNotification, notifications } from './notifications';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { activeHeaderAlert, orgMissingPaymentMethod } from '$routes/console/store';
import MarkedForDeletion from '$lib/components/billing/alerts/markedForDeletion.svelte';
import { BillingPlan } from '$lib/constants';
import PaymentMandate from '$lib/components/billing/alerts/paymentMandate.svelte';
import MissingPaymentMethod from '$lib/components/billing/alerts/missingPaymentMethod.svelte';
import LimitReached from '$lib/components/billing/alerts/limitReached.svelte';
import { wizard } from './wizard';
import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
import { trackEvent } from '$lib/actions/analytics';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const plansInfo = derived(page, ($page) => $page.data.plansInfo as PlansMap);
export const daysLeftInTrial = writable<number>(0);
export const readOnly = writable<boolean>(false);

export function tierToPlan(tier: Tier) {
    switch (tier) {
        case BillingPlan.STARTER:
            return tierFree;
        case BillingPlan.PRO:
            return tierPro;
        case BillingPlan.SCALE:
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
    if (!info) return 0;
    const plan = info.get(tier ?? get(organization)?.billingPlan);
    return plan?.[serviceId];
}

export const failedInvoice = cachedStore<
    Invoice,
    {
        load: (orgId: string) => Promise<void>;
    }
>('failedInvoice', function ({ set }) {
    return {
        load: async (orgId) => {
            if (!isCloud) set(null);
            const invoices = await sdk.forConsole.billing.listInvoices(orgId);
            const failedInvoices = invoices.invoices.filter((i) => i.status === 'failed');
            // const failedInvoices = invoices.invoices;
            if (failedInvoices?.length > 0) {
                const firstFailed = failedInvoices[0];
                const today = new Date();
                const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
                const failedDate = new Date(firstFailed.$createdAt);
                if (failedDate < thirtyDaysAgo) {
                    readOnly.set(true);
                }
            } else set(null);
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
    if (plan === BillingPlan.PRO || plan === BillingPlan.SCALE) {
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
    if (org?.billingPlan === BillingPlan.STARTER) return false;
    const endDate = new Date(org?.billingStartDate);
    const today = new Date();

    let diffTime = endDate.getTime() - today.getTime();
    diffTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const days = diffTime < 1 ? 0 : diffTime;

    daysLeftInTrial.set(days);
    return days;
}

export async function checkForUsageLimit(org: Organization) {
    if (org.billingPlan !== BillingPlan.STARTER) {
        readOnly.set(false);
        return;
    }
    if (!org?.billingLimits) {
        readOnly.set(false);
        return;
    }
    const { bandwidth, documents, executions, storage, users } = org?.billingLimits ?? {};
    const resources = [
        { value: bandwidth, name: 'bandwidth' },
        { value: documents, name: 'documents' },
        { value: executions, name: 'executions' },
        { value: storage, name: 'storage' },
        { value: users, name: 'users' }
    ];

    const members = await sdk.forConsole.teams.listMemberships(org.$id);
    const plan = get(plansInfo)?.get(org.billingPlan);
    const membersOverflow =
        members?.total > plan.members ? members.total - (plan.members || members.total) : 0;

    if (resources.some((r) => r.value >= 100) || membersOverflow > 0) {
        readOnly.set(true);
        headerAlert.add({
            id: 'limitReached',
            component: LimitReached,
            show: true,
            importance: 7
        });
    } else if (resources.some((r) => r.value >= 75)) {
        readOnly.set(false);
        const lastNotification = parseInt(localStorage.getItem('limitReachedNotification')) ?? 0;
        const now = new Date().getTime();
        if (now - lastNotification < 1000 * 60 * 60 * 24) return;

        localStorage.setItem('limitReachedNotification', now.toString());
        let message = `<b>${org.name}</b> has reached <b>75%</b> of the Starter plan's ${resources.find((r) => r.value >= 75).name} limit. Upgrade to ensure there are no service disruptions.`;
        if (resources.filter((r) => r.value >= 75)?.length > 1) {
            message = `Usage for <b>${org.name}</b> has reached 75% of the Starter plan limit. Upgrade to ensure there are no service disruptions.`;
        }
        addNotification({
            type: 'warning',
            isHtml: true,
            timeout: 0,
            message,
            buttons: [
                {
                    name: 'View usage',
                    method: () => {
                        goto(`${base}/console/organization-${org.$id}/usage`);
                    }
                },
                {
                    name: 'Upgrade plan',
                    method: () => {
                        wizard.start(ChangeOrganizationTierCloud);
                        trackEvent('click_organization_upgrade', {
                            from: 'button',
                            source: 'limit_reached_notification'
                        });
                    }
                }
            ]
        });
    } else {
        readOnly.set(false);
    }
}

export async function checkPaymentAuthorizationRequired(org: Organization) {
    if (org.billingPlan === BillingPlan.STARTER) return;

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
            importance: 10
        });
    }
}

export const paymentMissingMandate = writable<PaymentMethodData>(null);

export async function checkForMandate(org: Organization) {
    const paymentId = org.paymentMethodId ?? org.backupPaymentMethodId;
    if (!paymentId) return;
    const paymentMethod = await sdk.forConsole.billing.getPaymentMethod(paymentId);
    if (paymentMethod.mandateId === null && paymentMethod.country === 'in') {
        headerAlert.add({
            id: 'paymentMandate',
            component: PaymentMandate,
            show: true,
            importance: 8
        });
        activeHeaderAlert.set(headerAlert.get());
        paymentMissingMandate.set(paymentMethod);
    }
}

export async function checkForMissingPaymentMethod() {
    const orgs = await sdk.forConsole.billing.listOrganization([
        Query.notEqual('billingPlan', BillingPlan.STARTER),
        Query.isNull('paymentMethodId'),
        Query.isNull('backupPaymentMethodId')
    ]);
    if (orgs?.total) {
        orgMissingPaymentMethod.set(orgs.teams[0]);
        headerAlert.add({
            id: 'missingPaymentMethod',
            component: MissingPaymentMethod,
            show: true,
            importance: 8
        });
    }
}
