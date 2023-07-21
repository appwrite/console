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
        console.log(methods);
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
            clientSecret = methods.paymentMethods[0]?.clientSecret;
            if (!clientSecret) {
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            }
            const options = {
                clientSecret: clientSecret ? clientSecret : paymentMethod.clientSecret,
                appearance: $app.themeInUse === 'dark' ? apperanceDark : apperanceLight
            };
            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            elements = stripe.elements(options);
            createForm();
        } catch (e) {
            // error = e.message;
            console.log(e);
        }
    }

    async function createForm() {
        paymentElement = elements.create('card');
        paymentElement.mount('#payment-element');
    }

    async function handleSubmit() {
        try {
            if (!clientSecret || !paymentMethod) {
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
                clientSecret = paymentMethod.clientSecret;
            }
            await stripe.retrieveSetupIntent(clientSecret);

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

<Modal {error} onSubmit={handleSubmit} size="big" bind:show>
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
