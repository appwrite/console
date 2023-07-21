<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import {
        loadStripe,
        type Stripe,
        type StripeCardElement,
        type StripeElements
    } from '@stripe/stripe-js';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { app } from '$lib/stores/app';
    import { apperanceDark, apperanceLight } from '$lib/stores/billing';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { VARS, hasStripePublicKey } from '$lib/system';

    export let show = false;

    let name: string;
    let error: string;
    let elements: StripeElements;
    let stripe: Stripe;
    let methods: PaymentList;
    let paymentElement: StripeCardElement;

    let clientSecret: string;
    let paymentMethod: PaymentMethodData;
    let paymentMethodId: string;
    let isStripeInitialized = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        if (methods?.total) {
            clientSecret = methods.paymentMethods[0]?.clientSecret;

            paymentMethodId = methods.paymentMethods[0].$id;
        }
        initialize();
    });

    async function initialize() {
        if (!hasStripePublicKey) return;
        stripe = await loadStripe(VARS.STRIPE_PUBLIC_KEY);
        isStripeInitialized = true;

        try {
            // Check if there is a payment method and get the client secret
            clientSecret = methods.paymentMethods[0]?.clientSecret;
            // If there is no payment method, create an empty one and get the client secret
            if (!clientSecret) {
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
                clientSecret = paymentMethod.clientSecret;
            }

            // Set up the options for the stripe elements
            const options = {
                clientSecret: clientSecret,
                appearance: $app.themeInUse === 'dark' ? apperanceDark : apperanceLight
            };
            // Set up Elements and then create form
            elements = stripe.elements(options);
            createForm();
        } catch (e) {
            error = e.message;
            console.log(e);
        }
    }

    async function createForm() {
        paymentElement = elements.create('card');
        paymentElement.mount('#payment-element');
    }

    async function handleSubmit() {
        try {
            // If a payment method was created during mount, use it, otherwise create a new one
            if (!paymentElement) {
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            }
            // Retireve the setup intent created with `createPaymentMethod`
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
                await sdk.forConsole.billing.updatePaymentMethod(
                    paymentMethod.$id,
                    setupIntent.payment_method
                );
                await invalidate(Dependencies.PAYMENT_METHODS);
                paymentElement.destroy();
                show = false;
                invalidate(Dependencies.PAYMENT_METHODS);
            } else console.log('something went wrong');
        } catch (e) {
            console.log(e);
            console.log(e.message);
            // trackError(StripeError, Submit.ProjectCreate);
        }
    }
</script>

<Modal bind:error onSubmit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Add Payment Method</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Cardholder name"
            placeholder="Cardholder name"
            bind:value={name}
            required
            autofocus={true} />

        <div id="payment-element">
            <!-- Elements will create form elements here -->
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>
