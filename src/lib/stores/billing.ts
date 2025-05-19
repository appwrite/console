import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { Click, trackEvent } from '$lib/actions/analytics';
import { page } from '$app/stores';
import LimitReached from '$lib/components/billing/alerts/limitReached.svelte';
import MarkedForDeletion from '$lib/components/billing/alerts/markedForDeletion.svelte';
import MissingPaymentMethod from '$lib/components/billing/alerts/missingPaymentMethod.svelte';
import newDevUpgradePro from '$lib/components/billing/alerts/newDevUpgradePro.svelte';
import PaymentAuthRequired from '$lib/components/billing/alerts/paymentAuthRequired.svelte';
import PaymentMandate from '$lib/components/billing/alerts/paymentMandate.svelte';
import { BillingPlan, NEW_DEV_PRO_UPGRADE_COUPON } from '$lib/constants';
import { cachedStore } from '$lib/helpers/cache';
import { sizeToBytes, type Size } from '$lib/helpers/sizeConvertion';
import type { AddressesList, PaymentList, PaymentMethodData, PlansMap } from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { activeHeaderAlert, orgMissingPaymentMethod } from '$routes/(console)/store';
import { Query, type Models } from '@appwrite.io/console';
import { derived, get, writable } from 'svelte/store';
import { headerAlert } from './headerAlert';
import { addNotification, notifications } from './notifications';
import { organization, type Organization, type OrganizationError } from './organization';
import { canSeeBilling } from './roles';
import { sdk } from './sdk';
import { user } from './user';
import BudgetLimitAlert from '$routes/(console)/organization-[organization]/budgetLimitAlert.svelte';
import TeamReadonlyAlert from '$routes/(console)/organization-[organization]/teamReadonlyAlert.svelte';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2' | 'auto-1' | 'cont-1' | 'ent-1';

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
    }
];

export const teamStatusReadonly = 'readonly';
export const billingLimitOutstandingInvoice = 'outstanding_invoice';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const plansInfo = derived(page, ($page) => $page.data.plansInfo as PlansMap);
export const daysLeftInTrial = writable<number>(0);
export const readOnly = writable<boolean>(false);

export const showBudgetAlert = derived(
    page,
    ($page) => ($page.data.organization?.billingLimits.budgetLimit ?? 0) >= 100
);

export function getRoleLabel(role: string) {
    return roles.find((r) => r.value === role)?.label ?? role;
}

export function tierToPlan(tier: string) {
    switch (tier) {
        case BillingPlan.Tier0:
            return tierFree;
        case BillingPlan.Tier1:
            return tierPro;
        case BillingPlan.Tier2:
            return tierScale;
        case BillingPlan.GITHUB_EDUCATION:
            return tierGitHubEducation;
        case BillingPlan.CUSTOM:
            return tierCustom;
        case BillingPlan.ENTERPRISE:
            return tierEnterprise;
        default:
            return tierFree;
    }
}

export function getNextTier(tier: Tier) {
    switch (tier) {
        case BillingPlan.Tier0:
            return BillingPlan.Tier1;
        case BillingPlan.Tier1:
            return BillingPlan.Tier2;
        default:
            return BillingPlan.Tier1;
    }
}

export function getPreviousTier(tier: Tier) {
    switch (tier) {
        case BillingPlan.Tier1:
            return BillingPlan.Tier0;
        case BillingPlan.Tier2:
            return BillingPlan.Tier1;
        default:
            return BillingPlan.Tier0;
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
    | 'authPhone'
    | 'imageTransformations';

export function getServiceLimit(
    serviceId: PlanServices,
    tier: BillingPlan = null,
    plan?: Models.BillingPlan
): number {
    if (!isCloud) return 0;
    if (!serviceId) return 0;
    const info = get(plansInfo);
    if (!info) return 0;
    plan ??= info.get(tier ?? (get(organization)?.billingPlan as unknown as BillingPlan));
    // members are no longer a variable on plan itself!
    // the correct info for members/seats, resides in `addons`.
    // plan > addons > seats/others
    if (serviceId === 'members') {
        // some don't include `limit`, so we fallback!
        return plan?.['addons']['seats']['limit'] ?? 1;
    }

    return plan?.[serviceId] ?? 0;
}

export const failedInvoice = cachedStore<
    Models.Invoice,
    {
        load: (orgId: string) => Promise<void>;
    }
>('failedInvoice', function ({ set }) {
    return {
        load: async (orgId) => {
            if (!isCloud) set(null);
            if (!get(canSeeBilling)) set(null);
            const failedInvoices = await sdk.forConsole.organizations.listInvoices(orgId, [
                Query.equal('status', 'failed')
            ]);
            // const failedInvoices = invoices.invoices;
            if (failedInvoices?.invoices?.length > 0) {
                const firstFailed = failedInvoices.invoices[0];
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

export const actionRequiredInvoices = writable<Models.InvoiceList>(null);

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

export const tierEnterprise: TierData = {
    name: 'Enterprise',
    description: 'For enterprises that need more power and premium support.'
};

export const showUsageRatesModal = writable<boolean>(false);

export function checkForUsageFees(plan: Tier, id: PlanServices) {
    if (plan === BillingPlan.Tier2 || plan === BillingPlan.Tier1) {
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

export function isServiceLimited(serviceId: PlanServices, plan: BillingPlan, total: number) {
    if (!total) return false;
    const limit = getServiceLimit(serviceId) || Infinity;
    const isLimited = limit !== 0 && limit < Infinity;
    const hasUsageFees = checkForUsageFees(plan, serviceId);
    return isLimited && total >= limit && !hasUsageFees;
}

export function calculateTrialDay(org: Organization) {
    if (org?.billingPlan === BillingPlan.Tier0) return false;
    const endDate = new Date(org?.billingStartDate);
    const today = new Date();

    let diffTime = endDate.getTime() - today.getTime();
    diffTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const days = diffTime < 1 ? 0 : diffTime;

    daysLeftInTrial.set(days);
    return days;
}

export async function checkForUsageLimit(org: Organization) {
    if (org?.status === teamStatusReadonly && org?.remarks === billingLimitOutstandingInvoice) {
        headerAlert.add({
            id: 'teamReadOnlyFailedInvoices',
            component: TeamReadonlyAlert,
            show: true,
            importance: 11
        });
        readOnly.set(true);
        return;
    }
    if (!org?.billingLimits && org?.status !== teamStatusReadonly) {
        readOnly.set(false);
        return;
    }
    if (org?.billingPlan !== BillingPlan.Tier0) {
        const { budgetLimit } = org?.billingLimits ?? {};

        if (budgetLimit && budgetLimit >= 100) {
            readOnly.set(false);
            headerAlert.add({
                id: 'budgetLimit',
                component: BudgetLimitAlert,
                show: true,
                importance: 10
            });

            readOnly.set(true);
            return;
        }
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
    const plan = get(plansInfo)?.get(org.billingPlan as BillingPlan);
    const membersOverflow =
        members > plan.addons.seats.limit ? members - (plan.addons.seats.limit || members) : 0;

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
        let message = `<b>${org.name}</b> has reached <b>75%</b> of the ${tierToPlan(BillingPlan.Tier0).name} plan's ${resources.find((r) => r.value >= 75).name} limit. Upgrade to ensure there are no service disruptions.`;
        if (resources.filter((r) => r.value >= 75)?.length > 1) {
            message = `Usage for <b>${org.name}</b> has reached 75% of the ${tierToPlan(BillingPlan.Tier0).name} plan limit. Upgrade to ensure there are no service disruptions.`;
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
    if (org.billingPlan === BillingPlan.Tier0) return;

    const invoices = await sdk.forConsole.organizations.listInvoices(org.$id, [
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
    const payment = await sdk.forConsole.organizations.getPaymentMethod(
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
    const paymentMethod = await sdk.forConsole.account.getPaymentMethod(paymentId);
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
    const orgs = await sdk.forConsole.organizations.list([
        Query.notEqual('billingPlan', BillingPlan.Tier0),
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
    if (org?.billingPlan !== BillingPlan.Tier0 || !browser) return;

    const orgs = await sdk.forConsole.organizations.list([
        Query.notEqual('billingPlan', BillingPlan.Tier0)
    ]);
    if (orgs?.total) return;

    const now = new Date().getTime();
    const account = get(user);
    const accountCreated = new Date(account.$createdAt).getTime();
    if (now - accountCreated < 1000 * 60 * 60 * 24 * 7) return;
    const isDismissed = !!localStorage.getItem('newDevUpgradePro');
    if (isDismissed) return;
    // check if coupon already applied
    try {
        await sdk.forConsole.account.getCoupon(NEW_DEV_PRO_UPGRADE_COUPON);
    } catch (e) {
        return;
    }
    headerAlert.add({
        id: 'newDevUpgradePro',
        component: newDevUpgradePro,
        show: true,
        importance: 1
    });
}
export const upgradeURL = derived(
    page,
    ($page) => `${base}/organization-${$page.data?.organization?.$id}/change-plan`
);
export const billingURL = derived(
    page,
    ($page) => `${base}/organization-${$page.data?.organization?.$id}/billing`
);

export const hideBillingHeaderRoutes = ['/console/create-organization', '/console/account'];

export function calculateExcess(addon: Models.AggregationTeam, plan: Models.BillingPlan) {
    return {
        bandwidth: calculateResourceSurplus(addon.usageBandwidth, plan.bandwidth),
        storage: calculateResourceSurplus(addon.usageStorage, plan.storage, 'GB'),
        executions: calculateResourceSurplus(addon.usageExecutions, plan.executions, 'GB'),
        members: addon.additionalMembers
    };
}

export function calculateResourceSurplus(total: number, limit: number, limitUnit: Size = null) {
    if (total === undefined || limit === undefined) return 0;
    const realLimit = (limitUnit ? sizeToBytes(limit, limitUnit) : limit) || Infinity;
    return total > realLimit ? total - realLimit : 0;
}

export function isOrganization(
    org: Models.Organization<Record<string, unknown>> | OrganizationError
): org is Models.Organization<Record<string, unknown>> {
    return '$id' in org && org.$id !== undefined;
}

export function isOrganizationError(
    org: Models.Organization<Record<string, unknown>> | OrganizationError
): org is OrganizationError {
    return !('$id' in org);
}
