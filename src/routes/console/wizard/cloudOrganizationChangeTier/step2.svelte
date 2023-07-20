<script lang="ts">
    import { FormList, InputNumber, InputRadio, InputText } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { changeOrganizationTier } from './store';
    import UsageRates from '../cloudOrganization/usageRates.svelte';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { app } from '$lib/stores/app';
    import { apperanceDark, apperanceLight } from '$lib/stores/billing';
    import { VARS, hasStripePublicKey } from '$lib/system';

    let methods: PaymentList;
    let name: string;
    let budgetEnabled = false;
    let showRates = false;

    // let error: string;
    let elements: StripeElements;
    let stripe: Stripe;
    let clientSecret: string;
    let paymentMethod: PaymentMethodData;
    let isStripeInitialized = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        console.log(methods);
        if (methods?.total) {
            clientSecret = methods.paymentMethods[0]?.clientSecret;

            $changeOrganizationTier.paymentMethodId = methods.paymentMethods[0].$id;
        } else if (!isStripeInitialized) {
            initialize();
        }
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
            console.log(clientSecret);
            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            elements = stripe.elements(options);
            createForm();
        } catch (e) {
            // error = e.message;
            console.log(e);
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
            console.log(clientSecret);
            if (!clientSecret) {
                console.log('test2');
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod();
            }
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
            console.log(e);
            // trackError(StripeError, Submit.ProjectCreate);
        }
    }

    $: if ($changeOrganizationTier.paymentMethodId === null && !isStripeInitialized) {
        initialize();
    }

    $: if ($changeOrganizationTier.paymentMethodId) {
        isStripeInitialized = false;
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
                            bind:group={$changeOrganizationTier.paymentMethodId} />
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
                        bind:group={$changeOrganizationTier.paymentMethodId} />
                {/if}
                {#if $changeOrganizationTier.paymentMethodId === null}
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
                bind:value={$changeOrganizationTier.billingBudget} />
        {/if}
    </FormList>
</WizardStep>

<UsageRates bind:show={showRates} tier={$changeOrganizationTier?.billingPlan} />
