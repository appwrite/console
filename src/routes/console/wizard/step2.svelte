<script lang="ts">
    import { FormList, InputNumber, InputRadio, InputText } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createOrganization } from './store';
    import UsageRates from './usageRates.svelte';
    import type { PaymentList } from '$lib/stores/billing';
    import { paymentMethods } from '../account/payments/store';
    import {
        loadStripe,
        type Stripe,
        type StripeElements,
        type PaymentMethod
    } from '@stripe/stripe-js';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { app } from '$lib/stores/app';
    import { apperanceDark, apperanceLight, publicStripeKey } from '$lib/stores/billing';

    let methods: PaymentList;
    let name: string;
    let budgetEnabled = false;
    let showRates = false;

    // let error: string;
    let elements: StripeElements;
    let stripe: Stripe;
    let clientSecret: string;
    let paymentMethod: PaymentMethod;
    let isStripeInitialized = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        if (methods?.total) {
            $createOrganization.paymentMethodId = methods[0].id;
        } else if (!isStripeInitialized) initialize();
    });

    async function initialize() {
        stripe = await loadStripe(publicStripeKey);
        isStripeInitialized = true;

        try {
            clientSecret = $paymentMethods?.paymentMethods[0]?.clientSecret;
            if (!clientSecret) {
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            }
            const options = {
                clientSecret: clientSecret ? clientSecret : paymentMethod.clientSecret,
                appearance: $app.themeInUse === 'dark' ? apperanceDark : apperanceLight
            };
            console.log(clientSecret);
            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            elements = stripe.elements(options);
            createForm();
        } catch (e) {
            error = e.message;
        }
    }

    async function createForm() {
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
    }

    async function handleSubmit() {
        try {
            await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: 'http://localhost:3000'
                },
                redirect: 'if_required'
            });
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            const { setupIntent } = await stripe.retrieveSetupIntent(paymentMethod.clientSecret);
            if (setupIntent && setupIntent.status === 'succeeded') {
                await sdk.forConsole.billing.setOrganizationPaymentMethod(
                    $organization.$id,
                    paymentMethod.$id
                );
                await invalidate(Dependencies.PAYMENT_METHODS);
                console.log('test');
                // const paymentElement = elements.getElement('payment');
                // paymentElement.destroy();
            } else console.log('test2');
        } catch (e) {
            error = e.message;
            console.log(e);
            // trackError(StripeError, Submit.ProjectCreate);
        }
    }

    $: if ($createOrganization.paymentMethodId === null && !isStripeInitialized) {
        initialize();
    }
</script>

<WizardStep beforeSubmit={handleSubmit}>
    <svelte:fragment slot="title">Payment details</svelte:fragment>
    <svelte:fragment slot="subtitle">Add a payment method to your organization.</svelte:fragment>

    <FormList>
        <div class:boxes-wrapper={methods?.total}>
            {#if methods?.total}
                {#each methods.paymentMethods as method}
                    <div class="box">
                        <InputRadio
                            id={`payment-method-${method.last4}`}
                            label={`${method.brand} ending in ${method.last4}`}
                            value={method.$id}
                            name="payment"
                            group={$createOrganization.paymentMethodId} />
                    </div>
                {/each}
            {/if}

            <div class="box">
                {#if methods?.total}
                    <InputRadio
                        id="payment-method"
                        label="Add new payment method"
                        value={null}
                        name="payment"
                        group={$createOrganization.paymentMethodId} />
                {/if}
                {#if $createOrganization.paymentMethodId === null}
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
                {/if}
            </div>
        </div>

        <InputChoice
            type="switchbox"
            id="budget"
            label="Enable budget cap"
            tooltip="If enabled, you will be notified by email when your project spend reaches 75% of the cap you set. Update your budget cap alerts in Organization Settings."
            bind:value={budgetEnabled}>
            <p class="text">
                Restrict your resource usage by setting a budget cap. <button
                    class="link"
                    type="button"
                    on:click={() => (showRates = true)}>
                    Learn more about usage rates</button
                >.
            </p>
        </InputChoice>
        {#if budgetEnabled}
            <InputNumber
                id="budget"
                label="Budget cap"
                placeholder="0"
                bind:value={$createOrganization.billingBudget} />
        {/if}
    </FormList>
</WizardStep>

<UsageRates bind:show={showRates} />
