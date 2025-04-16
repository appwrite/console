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
    PaymentMethodData,
    OrganizationUsage,
    Plan
} from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { cachedStore } from '$lib/helpers/cache';
import { Query } from '@appwrite.io/console';
import { headerAlert } from './headerAlert';
import PaymentAuthRequired from '$lib/components/billing/alerts/paymentAuthRequired.svelte';
import { addNotification, notifications } from './notifications';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { activeHeaderAlert, orgMissingPaymentMethod } from '$routes/(console)/store';
import MarkedForDeletion from '$lib/components/billing/alerts/markedForDeletion.svelte';
import { BillingPlan } from '$lib/constants';
import PaymentMandate from '$lib/components/billing/alerts/paymentMandate.svelte';
import MissingPaymentMethod from '$lib/components/billing/alerts/missingPaymentMethod.svelte';
import LimitReached from '$lib/components/billing/alerts/limitReached.svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import newDevUpgradePro from '$lib/components/billing/alerts/newDevUpgradePro.svelte';
import { last } from '$lib/helpers/array';
import { sizeToBytes, type Size } from '$lib/helpers/sizeConvertion';
import { user } from './user';
import { browser } from '$app/environment';
import { canSeeBilling } from './roles';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2' | 'auto-1' | 'cont-1';

export const roles = [
    {
        label: 'Owner',
        value: 'owner'
    },
    {
        label: 'Developer',
        value: 'developer'
    },
    {
        label: 'Editor',
        value: 'editor'
    },
    {
        label: 'Analyst',
        value: 'analyst'
    },
    {
        label: 'Billing',
        value: 'billing'
    },
    {
        label: 'Designer',
        value: 'designer'
    }
];

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const plansInfo = derived(page, ($page) => $page.data.plansInfo as PlansMap);
export const daysLeftInTrial = writable<number>(0);
export const readOnly = writable<boolean>(false);

export function getRoleLabel(role: string) {
    return roles.find((r) => r.value === role)?.label ?? role;
}

export function tierToPlan(tier: Tier) {
    switch (tier) {
        case BillingPlan.FREE:
            return tierFree;
        case BillingPlan.PRO:
            return tierPro;
        case BillingPlan.SCALE:
            return tierScale;
        case BillingPlan.GITHUB_EDUCATION:
            return tierGitHubEducation;
        case BillingPlan.CUSTOM:
            return tierCustom;
        default:
            return tierFree;
    }
}

export function getNextTier(tier: Tier) {
    switch (tier) {
        case BillingPlan.FREE:
            return BillingPlan.PRO;
        case BillingPlan.PRO:
            return BillingPlan.SCALE;
        default:
            return BillingPlan.PRO;
    }
}

export function getPreviousTier(tier: Tier) {
    switch (tier) {
        case BillingPlan.PRO:
            return BillingPlan.FREE;
        case BillingPlan.SCALE:
            return BillingPlan.PRO;
        default:
            return BillingPlan.FREE;
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
    | 'webhooks'
    | 'sites'
    | 'authPhone';

export function getServiceLimit(serviceId: PlanServices, tier: Tier = null, plan?: Plan): number {
    if (!isCloud) return 0;
    if (!serviceId) return 0;
    const info = get(plansInfo);
    if (!info) return 0;
    plan ??= info.get(tier ?? get(organization)?.billingPlan);
    return plan?.[serviceId] ?? 0;
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
            if (!get(canSeeBilling)) set(null);
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
    name: 'Free',
    description: 'A great fit for passion projects and small applications.'
};

export const tierGitHubEducation: TierData = {
    name: 'GitHub Education',
    description: 'For members of GitHub student developers program.'
};

export const tierPro: TierData = {
    name: 'Pro',
    description:
        'For production applications that need powerful functionality and resources to scale.'
};
export const tierScale: TierData = {
    name: 'Scale',
    description:
        'For teams that handle more complex and large projects and need more control and support.'
};

export const tierCustom: TierData = {
    name: 'Custom',
    description: 'Team on a custom contract'
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
    if (org?.billingPlan === BillingPlan.FREE) return false;
    const endDate = new Date(org?.billingStartDate);
    const today = new Date();

    let diffTime = endDate.getTime() - today.getTime();
    diffTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const days = diffTime < 1 ? 0 : diffTime;

    daysLeftInTrial.set(days);
    return days;
}

export async function checkForUsageLimit(org: Organization) {
    if (org?.billingPlan !== BillingPlan.FREE) {
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

    const members = org.total;
    const plan = get(plansInfo)?.get(org.billingPlan);
    const membersOverflow = members > plan.members ? members - (plan.members || members) : 0;

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
        let message = `<b>${org.name}</b> has reached <b>75%</b> of the ${tierToPlan(BillingPlan.FREE).name} plan's ${resources.find((r) => r.value >= 75).name} limit. Upgrade to ensure there are no service disruptions.`;
        if (resources.filter((r) => r.value >= 75)?.length > 1) {
            message = `Usage for <b>${org.name}</b> has reached 75% of the ${tierToPlan(BillingPlan.FREE).name} plan limit. Upgrade to ensure there are no service disruptions.`;
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
                        goto(`${base}/organization-${org.$id}/usage`);
                    }
                },
                {
                    name: 'Upgrade plan',
                    method: () => {
                        goto(`${base}/organization-${org.$id}/change-plan`);
                        trackEvent(Click.OrganizationClickUpgrade, {
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
    if (org.billingPlan === BillingPlan.FREE) return;

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
    const payment = await sdk.forConsole.billing.getOrganizationPaymentMethod(
        org.$id,
        org.paymentMethodId
    );
    if (!payment?.expiryYear) return;
    const sessionStorageNotification = sessionStorage.getItem('expiredPaymentNotification');
    if (sessionStorageNotification === 'true') return;
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
                        goto(`${base}/account/payments`);
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
                        goto(`${base}/account/payments`);
                    }
                }
            ]
        });
    }
    sessionStorage.setItem('expiredPaymentNotification', 'true');
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
    if (paymentMethod?.mandateId === null && paymentMethod?.country.toLowerCase() === 'in') {
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
        Query.notEqual('billingPlan', BillingPlan.FREE),
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

// Display upgrade banner for new users after 1 week for 30 days
export async function checkForNewDevUpgradePro(org: Organization) {
    if (org?.billingPlan !== BillingPlan.FREE || !browser) return;

    const orgs = await sdk.forConsole.billing.listOrganization([
        Query.notEqual('billingPlan', BillingPlan.FREE)
    ]);
    if (orgs?.total) return;

    const now = new Date().getTime();
    const account = get(user);
    const accountCreated = new Date(account.$createdAt).getTime();
    if (now - accountCreated < 1000 * 60 * 60 * 24 * 7) return;
    const isDismissed = !!localStorage.getItem('newDevUpgradePro');
    if (isDismissed) return;
    if (now - accountCreated < 1000 * 60 * 60 * 24 * 37) {
        headerAlert.add({
            id: 'newDevUpgradePro',
            component: newDevUpgradePro,
            show: true,
            importance: 1
        });
    }
}
export const upgradeURL = derived(
    page,
    ($page) => `${base}/organization-${$page.data?.organization?.$id}/change-plan`
);

export const hideBillingHeaderRoutes = ['/console/create-organization', '/console/account'];

export function calculateExcess(usage: OrganizationUsage, plan: Plan, members: number) {
    const totBandwidth = usage?.bandwidth?.length > 0 ? last(usage.bandwidth).value : 0;
    return {
        bandwidth: calculateResourceSurplus(totBandwidth, plan.bandwidth),
        storage: calculateResourceSurplus(usage?.storageTotal, plan.storage, 'GB'),
        users: calculateResourceSurplus(usage?.usersTotal, plan.users),
        executions: calculateResourceSurplus(usage?.executionsTotal, plan.executions, 'GB'),
        members: calculateResourceSurplus(members, plan.members)
    };
}

export function calculateResourceSurplus(total: number, limit: number, limitUnit: Size = null) {
    if (total === undefined || limit === undefined) return 0;
    const realLimit = (limitUnit ? sizeToBytes(limit, limitUnit) : limit) || Infinity;
    return total > realLimit ? total - realLimit : 0;
}
