import { page } from '$app/stores';

import { derived, writable } from 'svelte/store';

export const publicKey = import.meta.env?.VITE_STRIPE_PUBLIC_KEY?.toString() as string | undefined;
export const secretKey = import.meta.env?.VITE_STRIPE_SECRET_KEY?.toString() as string | undefined;

function createCustomerStore() {
    const { subscribe, set } = writable<Stripe.Customer | Stripe.DeletedCustomer>(undefined);
    return {
        subscribe,
        set,
        load: async (id: string) => {
            const customer: Stripe.Customer | Stripe.DeletedCustomer =
                await stripe.customers.retrieve(id);
            set(customer);
        },
        create: async (params: Stripe.CustomerCreateParams) => {
            const customer: Stripe.Customer = await stripe.customers.create(params);
            set(customer);
        },
        update: async (id: string, params: Stripe.CustomerUpdateParams) => {
            const customer: Stripe.Customer = await stripe.customers.update(id, params);
            set(customer);
        },
        remove: async (id: string) => {
            const customer: Stripe.DeletedCustomer = await stripe.customers.del(id);
            set(customer);
        }
    };
}

export const customer = createCustomerStore();

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods);
