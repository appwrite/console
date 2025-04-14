import type { Stripe, StripeElement, StripeElements } from '@stripe/stripe-js';
import { sdk } from './sdk';
import { app } from './app';
import { get, writable } from 'svelte/store';
import type { PaymentMethodData } from '$lib/sdk/billing';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from './notifications';
import { organization } from './organization';
import { base } from '$app/paths';

export const stripe = writable<Stripe>();
let paymentMethod: PaymentMethodData;
let clientSecret: string;
let elements: StripeElements;
let paymentElement: StripeElement;

export const isStripeInitialized = writable(false);

export async function initializeStripe() {
    if (!get(stripe)) return;
    isStripeInitialized.set(true);

    const methods = await sdk.forConsole.billing.listPaymentMethods();

    // Get the client secret from empty payment method if available
    clientSecret = methods.paymentMethods?.filter(
        (method) => !!method?.clientSecret && !method?.providerMethodId
    )[0]?.clientSecret;

    // If there is no payment method, create an empty one and get the client secret
    if (!clientSecret) {
        paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
        clientSecret = paymentMethod.clientSecret;
    }

    // Set up the options for the stripe elements
    const options = {
        clientSecret: clientSecret,
        appearance: get(app).themeInUse === 'dark' ? appearanceDark : appearanceLight
    };
    // Set up Elements and then create form
    elements = get(stripe).elements(options);
    paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
}

export async function unmountPaymentElement() {
    isStripeInitialized.set(false);
    paymentElement?.unmount();
    clientSecret = null;
    paymentMethod = null;
    elements = null;
}

export async function submitStripeCard(name: string, organizationId?: string) {
    try {
        // If a payment method was created during initialization, use it, otherwise create a new one
        if (!paymentMethod) {
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            clientSecret = paymentMethod.clientSecret;
        }

        // // Element needs to be submitted before confirming the setup intent
        await elements.submit();

        const baseUrl = 'https://cloud.appwrite.io/console';
        const accountUrl = `${baseUrl}/account/payments?clientSecret=${clientSecret}`;
        const orgUrl = `${baseUrl}/organization-${organizationId}/billing?clientSecret=${clientSecret}`;

        const returnUrl = new URL(organizationId ? orgUrl : accountUrl);

        returnUrl.searchParams.append('clientSecret', clientSecret);
        returnUrl.searchParams.append('paymentMethodId', paymentMethod.$id);

        const { setupIntent, error } = await get(stripe).confirmSetup({
            elements,
            clientSecret,
            confirmParams: {
                return_url: returnUrl.toString(),
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
            throw e;
        }

        if (setupIntent && setupIntent.status === 'succeeded') {
            const method = await sdk.forConsole.billing.setPaymentMethod(
                paymentMethod.$id,
                setupIntent.payment_method,
                name
            );
            paymentElement.destroy();
            isStripeInitialized.set(false);
            trackEvent(Submit.PaymentMethodCreate);
            return method;
        } else {
            const e = new Error('Something went wrong');
            trackError(e, Submit.PaymentMethodCreate);
            throw e.message;
        }
    } catch (e) {
        trackError(e, Submit.PaymentMethodCreate);
        throw e;
    }
}

export async function confirmPayment(
    orgId: string,
    clientSecret: string,
    paymentMethodId: string,
    route?: string
) {
    try {
        const url =
            window.location.origin + (route ? route : `${base}/organization-${orgId}/billing`);

        const paymentMethod = await sdk.forConsole.billing.getPaymentMethod(paymentMethodId);

        const { error } = await get(stripe).confirmPayment({
            clientSecret: clientSecret,
            confirmParams: {
                return_url: url,
                payment_method: paymentMethod.providerMethodId
            }
        });
        if (error) {
            throw error.message;
        }
    } catch (e) {
        addNotification({
            title: 'Error',
            message:
                'There was an error processing your payment, try again later. If the problem persists, please contact support.',
            type: 'error'
        });
    }
}

export async function confirmSetup(
    clientSecret: string,
    paymentMethodId: string,
    urlRoute?: string
) {
    const baseUrl = 'https://cloud.appwrite.io/console/';

    const { setupIntent, error } = await get(stripe).confirmCardSetup(clientSecret, {
        payment_method: paymentMethodId,
        return_url: `${baseUrl}${
            urlRoute ?? `organization-${get(organization).$id}/billing?clientSecret=${clientSecret}`
        }`
    });

    if (error) {
        const e = new Error(error.message);
        trackError(e, Submit.VerifyPayment);
        addNotification({
            message: error.message,
            type: 'error'
        });
    }

    if (setupIntent && setupIntent.status === 'succeeded') {
        trackEvent(Submit.VerifyPayment);
        addNotification({
            message: 'Payment method verified successfully',
            type: 'success'
        });
    } else {
        const e = new Error('Something went wrong. Please try again later.');
        trackError(e, Submit.VerifyPayment);
        addNotification({
            message: e.message,
            type: 'error'
        });
    }
}

const appearanceLight = {
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

const appearanceDark = {
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
