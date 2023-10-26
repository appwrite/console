import type { Stripe, StripeElement, StripeElements } from '@stripe/stripe-js';
import { sdk } from './sdk';
import { app } from './app';
import { get, writable } from 'svelte/store';
import type { PaymentMethodData } from '$lib/sdk/billing';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

export const stripe = writable<Stripe>();
let paymentMethod: PaymentMethodData;
let clientSecret: string;
let elements: StripeElements;
let paymentElement: StripeElement;

export const isStripeInitialized = writable(false);

export async function initializeStripe() {
    if (!get(stripe)) return;
    isStripeInitialized.set(true);

    try {
        const methods = await sdk.forConsole.billing.listPaymentMethods();
        clientSecret = methods.paymentMethods[0]?.clientSecret;

        // If there is no payment method, create an empty one and get the client secret
        if (!clientSecret) {
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            clientSecret = paymentMethod.clientSecret;
        }

        // Set up the options for the stripe elements
        const options = {
            clientSecret: clientSecret,
            appearance: get(app).themeInUse === 'dark' ? apperanceDark : apperanceLight
        };
        // Set up Elements and then create form
        elements = get(stripe).elements(options);
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
    } catch (e) {
        console.log(e);
        throw e;
    }
}

// TODO: fix redirect

export async function submitStripeCard(name?: string, urlRoute?: string) {
    try {
        // If a payment method was created during initialization, use it, otherwise create a new one
        if (!paymentMethod) {
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            clientSecret = paymentMethod.clientSecret;
        }

        // // Element needs to be submitted before confirming the setup intent
        elements.submit();

        const baseUrl = 'https://cloud.appwrite.io/console/';

        const { setupIntent, error } = await get(stripe).confirmSetup({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${baseUrl}${urlRoute ?? 'account/payments?to=test'}`,
                payment_method_data: {
                    billing_details: {
                        name
                    }
                }
            },
            redirect: 'if_required'
        });

        if (error) {
            const e = new Error(error.message);
            trackError(e, Submit.PaymentMethodCreate);
            throw error;
        }

        if (setupIntent && setupIntent.status === 'succeeded') {
            const method = await sdk.forConsole.billing.setPaymentMethod(
                paymentMethod.$id,
                setupIntent.payment_method
            );
            paymentElement.destroy();
            isStripeInitialized.set(false);
            trackEvent(Submit.PaymentMethodCreate);
            return method;
        } else {
            const e = new Error('Something went wrong');
            trackError(e, Submit.PaymentMethodCreate);
            console.log('setupIntent failed');
            throw e;
        }
    } catch (e) {
        trackError(e, Submit.PaymentMethodCreate);
        console.log(e);
        throw e;
    }
}

const apperanceLight = {
    variables: {
        colorPrimary: '#606a7b',
        colorText: 'rgb(107, 107, 112)',
        colorBackground: '#FFFFFF',
        color: '#606a7b',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, arial, sans-serif',
        borderRadius: '4px'
    },
    rules: {
        '.Input:hover': {
            border: 'solid 1px rgb(195, 195, 198)',
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: 'solid 1px rgb(195, 195, 198)',
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

const apperanceDark = {
    variables: {
        colorPrimary: '#606a7b',
        colorText: 'rgb(195, 195, 198)',
        colorBackground: 'rgb(24, 24, 27)',
        colorDanger: '#FF453A',
        fontFamily: 'Inter, arial, sans-serif',
        borderRadius: '4px',
        spacingGridRow: '16px'
    },
    rules: {
        '.Input:hover': {
            border: 'solid 1px rgb(87, 87, 92)',
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: 'solid 1px rgb(87, 87, 92)',
            boxShadow: 'none'
        },
        '.Input::placeholder': {
            color: 'rgb(87, 87, 92)'
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};
