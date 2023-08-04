import { page } from '$app/stores';
import { derived, get } from 'svelte/store';
import { sdk } from './sdk';
import { limitRates } from '$lib/constants';
import { organization } from './organization';
import type { AddressesList, Invoice, PaymentList } from '$lib/sdk/billing';
import { isCloud } from '$lib/system';
import { cachedStore } from '$lib/helpers/cache';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods as PaymentList);
export const addressList = derived(page, ($page) => $page.data.addressList as AddressesList);

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

export function getCreditCardImage(brand: string, width = 46, height = 32) {
    if (!brand) return '';
    return sdk.forConsole.avatars.getCreditCard(brand, width, height).toString();
}

export function getServiceLimit(serviceId: string) {
    return limitRates?.[get(organization)?.billingPlan]?.find((l) => l.id === serviceId);
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

export const tierFree = {
    price: 0,
    name: 'Free',
    description: 'For personal, passion projects.',
    collaboratorPrice: undefined
};

export const tierPro = {
    price: 15,
    name: 'Pro',
    description: 'For pro developers and production projects that need the ability to scale.',
    collaboratorPrice: 15
};
export const tierScale = {
    price: 685,
    name: 'Scale',
    description: 'For scaling teams that need dedicated support.',
    collaboratorPrice: 0
};

export const apperanceLight = {
    variables: {
        colorPrimary: '#606a7b',
        colorText: '#373B4D',
        colorBackground: '#FFFFFF',
        color: '#606a7b',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, arial, sans-serif',
        borderRadius: '4px'
    },
    rules: {
        '.Input:hover': {
            border: 'solid 1px #C4C6D7',
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: 'solid 1px #C4C6D7',
            boxShadow: 'none'
        },
        '.Input::placeholder': {
            color: '#C4C6D7'
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};
export const apperanceDark = {
    variables: {
        colorPrimary: '#606a7b',
        colorText: '#C5C7D8',
        colorBackground: '#161622',
        colorDanger: '#FF453A',
        fontFamily: 'Inter, arial, sans-serif',
        borderRadius: '4px'
    },
    rules: {
        '.Input:hover': {
            border: 'solid 1px #4F5769',
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: 'solid 1px #4F5769',
            boxShadow: 'none'
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};
