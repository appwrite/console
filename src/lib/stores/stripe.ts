import { hasStripePublicKey, VARS } from '$lib/system';
import { loadStripe, type Stripe, type StripeCardElement } from '@stripe/stripe-js';
import { sdk } from './sdk';
import { app } from './app';
import { get, writable } from 'svelte/store';
import { apperanceDark, apperanceLight } from './billing';
import type { PaymentMethodData } from '$lib/sdk/billing';

let stripe: Stripe;
let paymentMethod: PaymentMethodData;
let clientSecret: string;
let paymentElement: StripeCardElement;

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
        const elements = stripe.elements(options);
        paymentElement = elements.create('card');
        paymentElement.mount('#payment-element');
    } catch (e) {
        console.log(e);
    }
}

export async function submitStripeCard(name: string) {
    try {
        // If a payment method was during initialization, use it, otherwise create a new one
        if (!paymentMethod) {
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            clientSecret = paymentMethod.clientSecret;
        }
        await stripe.retrieveSetupIntent(clientSecret);
        // Confirm the setup intent with the payment method
        const { setupIntent } = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: paymentElement,
                billing_details: {
                    name: name
                }
            }
        });

        if (setupIntent && setupIntent.status === 'succeeded') {
            const method = await sdk.forConsole.billing.updatePaymentMethod(
                paymentMethod.$id,
                setupIntent.payment_method
            );
            paymentElement.destroy();
            return method;
        } else console.log('something went wrong');
    } catch (e) {
        console.log(e);
        console.log(e.message);
        // trackError(StripeError, Submit.ProjectCreate);
    }
}
