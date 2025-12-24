import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { Click, trackEvent } from '$lib/actions/analytics';
import { page } from '$app/stores';
import LimitReached from '$lib/components/billing/alerts/limitReached.svelte';
import MarkedForDeletion from '$lib/components/billing/alerts/markedForDeletion.svelte';
import MissingPaymentMethod from '$lib/components/billing/alerts/missingPaymentMethod.svelte';
import newDevUpgradePro from '$lib/components/billing/alerts/newDevUpgradePro.svelte';
import PaymentAuthRequired from '$lib/components/billing/alerts/paymentAuthRequired.svelte';
import PaymentMandate from '$lib/components/billing/alerts/paymentMandate.svelte';
import { NEW_DEV_PRO_UPGRADE_COUPON } from '$lib/constants';
import { cachedStore } from '$lib/helpers/cache';
import { type Size, sizeToBytes } from '$lib/helpers/sizeConvertion';
import type { BillingPlansMap } from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { activeHeaderAlert, orgMissingPaymentMethod } from '$routes/(console)/store';
import {
    AppwriteException,
    BillingPlanGroup,
    type Models,
    Platform,
    Query
} from '@appwrite.io/console';
import { derived, get, writable } from 'svelte/store';
import { headerAlert } from './headerAlert';
import { addNotification, notifications } from './notifications';
import { currentPlan, type OrganizationError } from './organization';
import { canSeeBilling } from './roles';
import { sdk } from './sdk';
import { user } from './user';

import BudgetLimitAlert from '$routes/(console)/organization-[organization]/budgetLimitAlert.svelte';
import TeamReadonlyAlert from '$routes/(console)/organization-[organization]/teamReadonlyAlert.svelte';
import ProjectsLimit from '$lib/components/billing/alerts/projectsLimit.svelte';
import EnterpriseTrial from '$routes/(console)/organization-[organization]/enterpriseTrial.svelte';

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

export const paymentMethods = derived(
    page,
    ($page) => $page.data.paymentMethods as Models.PaymentMethodList
);
export const addressList = derived(
    page,
    ($page) => $page.data.addressList as Models.BillingAddressList
);

export const plansInfo = writable<BillingPlansMap>(new Map());
export const daysLeftInTrial = writable<number>(0);
export const readOnly = writable<boolean>(false);

export const showBudgetAlert = derived(
    page,
    ($page) => ($page.data.organization?.billingLimits.budgetLimit ?? 0) >= 100
);

function makeBillingPlan(billingPlanOrId: string | Models.BillingPlan): Models.BillingPlan {
    return typeof billingPlanOrId === 'string' ? billingIdToPlan(billingPlanOrId) : billingPlanOrId;
}

export function getRoleLabel(role: string) {
    return roles.find((r) => r.value === role)?.label ?? role;
}

export function isGitHubEducationPlan(billingPlanOrId: string | Models.BillingPlan): boolean {
    const billingPlan = makeBillingPlan(billingPlanOrId);
    return !isStarterPlan(billingPlan) && billingPlan.price === 0;
}

export function isStarterPlan(billingPlanOrId: string | Models.BillingPlan): boolean {
    const billingPlan = makeBillingPlan(billingPlanOrId);
    return planHasGroup(billingPlan, BillingPlanGroup.Starter);
}

export function canUpgrade(billingPlanOrId: string | Models.BillingPlan): boolean {
    const billingPlan = makeBillingPlan(billingPlanOrId);
    const nextTier = getNextTierBillingPlan(billingPlan.$id);

    // defaults back to PRO, so adjust the check!
    return billingPlan.$id !== nextTier.$id;
}

export function canDowngrade(billingPlanOrId: string | Models.BillingPlan): boolean {
    const billingPlan = makeBillingPlan(billingPlanOrId);
    const nextTier = getPreviousTierBillingPlan(billingPlan.$id);

    // defaults back to Starter, so adjust the check!
    return billingPlan.$id !== nextTier.$id;
}

export function planHasGroup(
    billingPlanOrId: string | Models.BillingPlan,
    group: BillingPlanGroup
): boolean {
    const billingPlan = makeBillingPlan(billingPlanOrId);

    return billingPlan?.group === group;
}

export function getBasePlanFromGroup(billingPlanGroup: BillingPlanGroup): Models.BillingPlan {
    const plansInfoStore = get(plansInfo);

    const proPlans = Array.from(plansInfoStore.values()).filter(
        (plan) => plan.group === billingPlanGroup
    );

    return proPlans.sort((a, b) => a.order - b.order)[0];
}

export function billingIdToPlan(billingId: string): Models.BillingPlan {
    const plansInfoStore = get(plansInfo);
    if (plansInfoStore.has(billingId)) {
        return plansInfoStore.get(billingId);
    } else {
        // fallback to PRO group's 1st item.
        // TODO: @itznotabug, @dlohani - but should we fallback to PRO?.
        return getBasePlanFromGroup(BillingPlanGroup.Pro);
    }
}

export function getNextTierBillingPlan(billingPlanId: string): Models.BillingPlan {
    const currentPlanData = billingIdToPlan(billingPlanId);
    const currentOrder = currentPlanData.order;
    const plans = get(plansInfo);

    for (const [, plan] of plans) {
        // TODO: @itznotabug, check for group maybe?
        if (plan.order === currentOrder + 1) {
            return plan;
        }
    }

    return getBasePlanFromGroup(BillingPlanGroup.Pro);
}

export function getPreviousTierBillingPlan(billingPlanId: string): Models.BillingPlan {
    const currentPlanData = billingIdToPlan(billingPlanId);
    const currentOrder = currentPlanData.order;
    const plans = get(plansInfo);

    for (const [, plan] of plans) {
        if (plan.order === currentOrder - 1) {
            return plan;
        }
    }

    return getBasePlanFromGroup(BillingPlanGroup.Starter);
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
    | 'projects'
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
    tier: string = null,
    plan?: Models.BillingPlan
): number {
    if (!isCloud) return 0;
    if (!serviceId) return 0;

    plan ??= get(currentPlan);

    if (tier) {
        const info = get(plansInfo);
        if (!info) return 0;
        plan ??= info.get(tier);
    }

    if (serviceId === 'members') {
        if (!plan?.addons?.seats) return Infinity;
        return plan.addons.seats?.limit ?? 1;
    }

    if (serviceId === 'projects') {
        if (!plan?.addons?.projects) return Infinity;
        return plan.addons.projects?.limit ?? 1;
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
            const failedInvoices = await sdk.forConsole.organizations.listInvoices({
                organizationId: orgId,
                queries: [Query.equal('status', 'failed')]
            });
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

export const showUsageRatesModal = writable<boolean>(false);
export const useNewPricingModal = derived(currentPlan, ($plan) => $plan?.usagePerProject === true);

export function checkForUsageFees(plan: string, id: PlanServices) {
    const billingPlan = billingIdToPlan(plan);
    const supportsUsage = Object.keys(billingPlan.usage).length > 0;

    if (supportsUsage) {
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

export function checkForProjectLimitation(plan: string, id: PlanServices) {
    if (id === 'members') {
        const billingPlan = billingIdToPlan(plan);
        const hasUnlimitedProjects = billingPlan.projects === 0;

        if (hasUnlimitedProjects) {
            return false; // No project limitation for members on Pro/Scale plans
        }
    }

    switch (id) {
        case 'databases':
        case 'functions':
        case 'buckets':
        case 'members': // Only applies to Free plan now
        case 'platforms':
        case 'webhooks':
        case 'teams':
            return true;

        default:
            return false;
    }
}

export function isServiceLimited(serviceId: PlanServices, plan: string, total: number) {
    if (!total) return false;
    const limit = getServiceLimit(serviceId) || Infinity;
    const isLimited = limit !== 0 && limit < Infinity;
    const hasUsageFees = checkForUsageFees(plan, serviceId);
    return isLimited && total >= limit && !hasUsageFees;
}

export function checkForEnterpriseTrial(org: Models.Organization) {
    if (!org || !org.billingNextInvoiceDate) return;
    if (calculateEnterpriseTrial(org) > 0) {
        headerAlert.add({
            id: 'teamEnterpriseTrial',
            component: EnterpriseTrial,
            show: true,
            importance: 11
        });
    }
}

export function calculateEnterpriseTrial(org: Models.Organization) {
    if (!org || !org.billingNextInvoiceDate) return 0;
    const endDate = new Date(org.billingNextInvoiceDate);
    const startDate = new Date(org.billingCurrentInvoiceDate);
    const today = new Date();

    let diffCycle = endDate.getTime() - startDate.getTime();
    diffCycle = Math.ceil(diffCycle / (1000 * 60 * 60 * 24));
    if (diffCycle === 14) {
        const remaining = endDate.getTime() - today.getTime();
        return Math.ceil(remaining / (1000 * 60 * 60 * 24));
    }
    return 0;
}

export function calculateTrialDay(org: Models.Organization) {
    if (!org.billingPlanDetails.trial) return false;

    const endDate = new Date(org?.billingStartDate);
    const today = new Date();

    let diffTime = endDate.getTime() - today.getTime();
    diffTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const days = diffTime < 1 ? 0 : diffTime;

    daysLeftInTrial.set(days);
    return days;
}

export async function checkForProjectsLimit(org: Models.Organization, orgProjectCount?: number) {
    if (!isCloud) return;
    if (!org) return;

    const plan = await sdk.forConsole.organizations.getPlan({
        organizationId: org.$id
    });
    if (!plan) return;

    if (!org.projects) return;
    if (org.projects.length > 0) return;

    const projectCount = orgProjectCount;
    if (projectCount === undefined) return;

    // not unlimited and current exceeds plan limits!
    if (plan.projects > 0 && projectCount > plan.projects) {
        headerAlert.add({
            id: 'projectsLimitReached',
            component: ProjectsLimit,
            show: true,
            importance: 12
        });
    }
}

export async function checkForUsageLimit(organization: Models.Organization) {
    if (
        organization?.status === teamStatusReadonly &&
        organization?.remarks === billingLimitOutstandingInvoice
    ) {
        headerAlert.add({
            id: 'teamReadOnlyFailedInvoices',
            component: TeamReadonlyAlert,
            show: true,
            importance: 11
        });
        readOnly.set(true);
        return;
    }

    if (!organization?.billingLimits && organization?.status !== teamStatusReadonly) {
        readOnly.set(false);
        return;
    }

    if (organization.billingPlanDetails.budgeting) {
        const { budgetLimit } = organization?.billingLimits ?? {};

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

    // TODO: @itznotabug - check with @abnegate, what do we do here? this is billing!
    const { bandwidth, executions, storage, users } = organization?.billingLimits ?? {};
    const resources = [
        { value: bandwidth, name: 'bandwidth' },
        { value: executions, name: 'executions' },
        { value: storage, name: 'storage' },
        { value: users, name: 'users' }
    ];

    const members = organization.total;
    const memberLimit = getServiceLimit('members');
    const membersOverflow = memberLimit === Infinity ? 0 : Math.max(0, members - memberLimit);

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

        const threshold = 75;
        const exceededResources = resources.filter((r) => r.value >= threshold);

        let message = `<b>${organization.name}</b> has reached <b>${threshold}%</b> of its ${exceededResources[0].name} limit. Upgrade to ensure there are no service disruptions.`;

        if (exceededResources.length > 1) {
            message = `Usage for <b>${organization.name}</b> has reached <b>${threshold}%</b> of its plan limits. Upgrade to ensure there are no service disruptions.`;
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
                        goto(
                            resolve('/(console)/organization-[organization]/usage', {
                                organization: organization.$id
                            })
                        );
                    }
                },
                {
                    name: 'Upgrade plan',
                    method: () => {
                        goto(
                            resolve('/(console)/organization-[organization]/change-plan', {
                                organization: organization.$id
                            })
                        );
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

export async function checkPaymentAuthorizationRequired(org: Models.Organization) {
    if (!org.billingPlanDetails.requiresPaymentMethod) return;

    const invoices = await sdk.forConsole.organizations.listInvoices({
        organizationId: org.$id,
        queries: [Query.equal('status', 'requires_authentication')]
    });

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

export async function paymentExpired(org: Models.Organization) {
    if (!org?.paymentMethodId) return;
    const payment = await sdk.forConsole.organizations.getPaymentMethod({
        organizationId: org.$id,
        paymentMethodId: org.paymentMethodId
    });

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
    const cardExpiry = new Date(payment.expiryYear, payment.expiryMonth, 1);
    const nextMonth = new Date(year, month + 1, 1);
    const isExpiringNextMonth = cardExpiry.getTime() === nextMonth.getTime();
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
                        goto(resolve('/account/payments'));
                    }
                }
            ]
        });
    } else if (!expiringNotification && !payment.expired && isExpiringNextMonth) {
        addNotification({
            type: 'warning',
            isHtml: true,
            message: expiringMessage,
            buttons: [
                {
                    name: 'Update payment details',
                    method: () => {
                        goto(resolve('/account/payments'));
                    }
                }
            ]
        });
    }
    sessionStorage.setItem('expiredPaymentNotification', 'true');
}

export function checkForMarkedForDeletion(org: Models.Organization) {
    if (org?.markedForDeletion) {
        headerAlert.add({
            id: 'markedForDeletion',
            component: MarkedForDeletion,
            show: true,
            importance: 10
        });
    }
}

export const paymentMissingMandate = writable<Models.PaymentMethod>(null);

export async function checkForMandate(org: Models.Organization) {
    const paymentId = org.paymentMethodId ?? org.backupPaymentMethodId;
    if (!paymentId) return;

    const paymentMethod = await sdk.forConsole.account.getPaymentMethod({
        paymentMethodId: paymentId
    });

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
    const orgs = await sdk.forConsole.organizations.list({
        queries: [
            Query.notEqual('billingPlan', getBasePlanFromGroup(BillingPlanGroup.Starter).$id),
            Query.isNull('paymentMethodId'),
            Query.isNull('backupPaymentMethodId'),
            Query.equal('platform', Platform.Appwrite)
        ]
    });

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
export async function checkForNewDevUpgradePro(org: Models.Organization) {
    // browser or plan check.
    if (!browser || !org.billingPlanDetails.supportsCredits) return;

    // already dismissed by user!
    if (localStorage.getItem('newDevUpgradePro')) return;

    // saves one trip to backend!
    const notValidKey = `${org.$id}:isNotValid`;
    if (localStorage.getItem(notValidKey)) return;

    const now = new Date().getTime();
    const account = get(user);
    const accountCreated = new Date(account.$createdAt).getTime();
    if (now - accountCreated < 1000 * 60 * 60 * 24 * 7) return;

    const organizations = await sdk.forConsole.organizations.list({
        queries: [Query.notEqual('billingPlan', getBasePlanFromGroup(BillingPlanGroup.Starter).$id)]
    });

    if (organizations?.total) return;

    try {
        await sdk.forConsole.console.getCoupon({
            couponId: NEW_DEV_PRO_UPGRADE_COUPON
        });
    } catch (error) {
        if (
            // already utilized if error is 409
            error instanceof AppwriteException &&
            error?.code === 409 &&
            error.type === 'billing_coupon_already_used'
        ) {
            localStorage.setItem(notValidKey, 'true');
        }
        return;
    }

    headerAlert.add({
        id: 'newDevUpgradePro',
        component: newDevUpgradePro,
        show: true,
        importance: 1
    });
}
export const upgradeURL = derived(page, ($page) => {
    return resolve('/(console)/organization-[organization]/change-plan', {
        organization: $page.data?.organization?.$id
    });
});

export const billingURL = derived(page, ($page) => {
    return resolve('/(console)/organization-[organization]/billing', {
        organization: $page.data?.organization?.$id
    });
});

export const hideBillingHeaderRoutes = [resolve('/account'), resolve('/create-organization')];

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
    org: Models.Organization | OrganizationError
): org is Models.Organization {
    return (org as Models.Organization).$id !== undefined;
}
