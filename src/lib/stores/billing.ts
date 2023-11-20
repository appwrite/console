import { page } from '$app/stores';
import { derived, get, writable } from 'svelte/store';
import { sdk } from './sdk';
import { organization } from './organization';
import type { AddressesList, Invoice, PaymentList, PlansInfo } from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { cachedStore } from '$lib/helpers/cache';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);
export const plansInfo = derived(page, ($page) => $page.data.plansInfo as PlansInfo);
export const daysLeftInTrial = writable<number>(0);
export const trialEndDate = writable<Date>();
export const readOnly = writable<ReadOnlyData>({
    bandwidth: false,
    documents: false,
    executions: false,
    storage: false,
    users: false
});

export type ReadOnlyData = {
    bandwidth: boolean;
    documents: boolean;
    executions: boolean;
    storage: boolean;
    users: boolean;
};

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

export function getServiceLimit(serviceId: PlanServices): number {
    if (!isCloud) return 0;
    if (!serviceId) return 0;
    const plan = get(plansInfo).plans.find((p) => p.$id === get(organization)?.billingPlan);
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

export type TierData = {
    price: number;
    name: string;
    description: string;
    collaboratorPrice?: number;
};

export const tierFree: TierData = {
    price: 0,
    name: 'Starter',
    description: 'For personal, passion projects.'
};

export const tierPro: TierData = {
    price: 15,
    name: 'Pro',
    description: 'For pro developers and production projects that need the ability to scale.'
};
export const tierScale: TierData = {
    price: 685,
    name: 'Scale',
    description: 'For scaling teams that need dedicated support.'
};
