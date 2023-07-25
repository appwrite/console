import { hasStripePublicKey, VARS } from '$lib/system';
import {
    loadStripe,
    type Stripe,
    type StripeElement,
    type StripeElements
} from '@stripe/stripe-js';
import { sdk } from './sdk';
import { app } from './app';
import { get, writable } from 'svelte/store';
import { apperanceDark, apperanceLight } from './billing';
import type { PaymentMethodData } from '$lib/sdk/billing';

let stripe: Stripe;
let paymentMethod: PaymentMethodData;
let clientSecret: string;
let elements: StripeElements;
let paymentElement: StripeElement;

export const isStripeInitialized = writable(false);

export async function initializeStripe() {
    if (!hasStripePublicKey) return;
    stripe = await loadStripe(VARS.STRIPE_PUBLIC_KEY);
    isStripeInitialized.set(true);

    try {
        const methods = await sdk.forConsole.billing.listPaymentMethods();
        clientSecret = methods.paymentMethods[0]?.clientSecret;
        // const emptyMethod = methods.paymentMethods.find((method) => method.last4 === null);
        // if (emptyMethod) {
        //     paymentMethod = emptyMethod;
        // }

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
        elements = stripe.elements(options);
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
    } catch (e) {
        console.log(e);
        throw e;
    }
}

// TODO: fix redirect

export async function submitStripeCard(name?: string) {
    try {
        // If a payment method was during initialization, use it, otherwise create a new one
        if (!paymentMethod) {
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            clientSecret = paymentMethod.clientSecret;
        }

        // Element needs to be submitted before confirming the setup intent
        elements.submit();

        const { setupIntent } = await stripe.confirmSetup({
            elements,
            clientSecret,
            confirmParams: {
                return_url: 'https://example.com',
                payment_method_data: {
                    billing_details: {
                        name
                    }
                }
            },
            redirect: 'if_required'
        });

        if (setupIntent && setupIntent.status === 'succeeded') {
            const method = await sdk.forConsole.billing.updatePaymentMethod(
                paymentMethod.$id,
                setupIntent.payment_method
            );
            paymentElement.destroy();
            return method;
        } else {
            console.log('something went wrong');
            throw new Error('Something went wrong');
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

// TODO: fix update

export async function updateStripeCard(selectedPaymentMethod?: string) {
    try {
        paymentMethod = await sdk.forConsole.billing.getPaymentMethod(selectedPaymentMethod);
        clientSecret = paymentMethod.clientSecret;

        // Element needs to be submitted before confirming the setup intent
        elements.submit();

        const { setupIntent } = await stripe.confirmSetup({
            elements,
            clientSecret,
            confirmParams: {
                return_url: 'https://example.com'
            },
            redirect: 'if_required'
        });

        if (setupIntent && setupIntent.status === 'succeeded') {
            const method = await sdk.forConsole.billing.updatePaymentMethod(
                paymentMethod.$id,
                setupIntent.payment_method
            );
            paymentElement.destroy();
            return method;
        } else {
            console.log('something went wrong');
            throw new Error('Something went wrong');
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}
