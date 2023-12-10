import { page } from '$app/stores';
import { derived, get, writable } from 'svelte/store';
import { sdk } from './sdk';
import { organization } from './organization';
import type { InvoiceList, AddressesList, Invoice, PaymentList, PlansInfo } from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { cachedStore } from '$lib/helpers/cache';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const plansInfo = derived(page, ($page) => $page.data.plansInfo as PlansInfo);
export const daysLeftInTrial = writable<number>(0);
export const readOnly = writable<boolean>(false);

// export type ReadOnlyData = {
//     bandwidth: boolean;
//     documents: boolean;
//     executions: boolean;
//     storage: boolean;
//     users: boolean;
// };

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
    const plan = get(plansInfo).plans.find(
        (p) => p.$id === (tier ?? get(organization)?.billingPlan)
    );
    return plan[serviceId];
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
                //TODO: if firstFailed is older than 30 days, set readonly to true!
                set(firstFailed);
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

export function isServiceLimited(serviceId: PlanServices, plan: Tier, total: number) {
    if (!total) return false;
    const limit = getServiceLimit(serviceId) || Infinity;
    const isLimited = limit !== 0 && limit < Infinity;
    const hasUsageFees = checkForUsageFees(plan, serviceId);
    console.log(serviceId, plan, total, limit, isLimited, hasUsageFees);
    return isLimited && total >= limit && !hasUsageFees;
}
