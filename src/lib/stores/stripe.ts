import type { Appearance, Stripe, StripeElement, StripeElements } from '@stripe/stripe-js';
import { sdk } from './sdk';
import { app } from './app';
import { get, writable } from 'svelte/store';
import type { PaymentMethodData } from '$lib/sdk/billing';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from './notifications';
import { organization } from './organization';
import { base } from '$app/paths';
import { ThemeDarkCloud, ThemeLightCloud } from '$themes';
import Color from 'color';

export const stripe = writable<Stripe>();
let paymentMethod: PaymentMethodData;
let clientSecret: string;
let elements: StripeElements;
let paymentElement: StripeElement;

export const isStripeInitialized = writable(false);

export async function initializeStripe(node: HTMLElement) {
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
    paymentElement.mount(node);
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

        // Element needs to be submitted before confirming the setup intent
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

function toRGB(color: string): string {
    return Color(color).rgb().string();
}

const appearanceLight: Appearance = {
    variables: {
        fontSizeBase: ThemeLightCloud['font-size-s'],
        fontSizeSm: ThemeLightCloud['font-size-s'],
        colorPrimary: toRGB(ThemeLightCloud['neutral-700']),
        colorTextSecondary: toRGB(ThemeLightCloud['neutral-700']),
        colorText: toRGB(ThemeLightCloud['neutral-700']),
        colorBackground: toRGB(ThemeLightCloud['neutral-25']),
        colorDanger: toRGB(ThemeLightCloud['web-red-700']),
        fontFamily:
            ThemeLightCloud['font-family-sansserif'] +
            ', system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        borderRadius: ThemeLightCloud['base-8']
    },
    rules: {
        '.Label': {
            color: toRGB(ThemeLightCloud['neutral-700']),
            marginBottom: ThemeLightCloud['base-8'],
            fontWeight: '500'
        },
        '.Input': {
            padding: ThemeLightCloud['base-6'],
            paddingLeft: ThemeLightCloud['base-12'],
            outlineOffset: '-1px'
        },
        '.Input:hover': {
            border: '1px solid ' + toRGB(ThemeLightCloud['neutral-250']),
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: '1px solid ' + toRGB(ThemeLightCloud['neutral-250']),
            outline: '2px solid ' + toRGB(ThemeLightCloud['neutral-250']),
            boxShadow: 'none'
        },
        '.Input::placeholder': {
            color: toRGB(ThemeLightCloud['neutral-250'])
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};

const appearanceDark = {
    variables: {
        fontSizeBase: ThemeDarkCloud['font-size-s'],
        fontSizeSm: ThemeDarkCloud['font-size-s'],
        colorPrimary: toRGB(ThemeDarkCloud['neutral-250']),
        colorText: toRGB(ThemeDarkCloud['neutral-250']),
        colorTextSecondary: toRGB(ThemeDarkCloud['neutral-250']),
        colorBackground: toRGB(ThemeDarkCloud['neutral-900']),
        colorDanger: toRGB(ThemeDarkCloud['web-red-500']),
        fontFamily:
            ThemeLightCloud['font-family-sansserif'] +
            ', system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        borderRadius: ThemeDarkCloud['base-8']
    },
    rules: {
        '.Label': {
            color: toRGB(ThemeDarkCloud['neutral-250']),
            marginBottom: ThemeDarkCloud['base-8'],
            fontWeight: '500'
        },
        '.Input': {
            padding: ThemeDarkCloud['base-6'],
            paddingLeft: ThemeDarkCloud['base-12'],
            outlineOffset: '-1px'
        },
        '.Input:hover': {
            border: '1px solid ' + toRGB(ThemeDarkCloud['neutral-500']),
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: '1px solid ' + toRGB(ThemeDarkCloud['neutral-500']),
            outline: '2px solid ' + toRGB(ThemeDarkCloud['neutral-500']),
            boxShadow: 'none'
        },
        '.Input::placeholder': {
            color: toRGB(ThemeDarkCloud['neutral-500'])
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};
