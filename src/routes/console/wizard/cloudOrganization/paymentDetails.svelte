<script lang="ts">
    import { FormList, InputNumber, InputRadio, InputText } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createOrganization } from './store';
    import type { PaymentList } from '$lib/sdk/billing';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import { sdk } from '$lib/stores/sdk';
    import { CreditCardBrandImage } from '$lib/components';
    import { toLocaleDate } from '$lib/helpers/date';
    import { showUsageRatesModal } from '$lib/stores/billing';

    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 44 * 24 * 60 * 60 * 1000);

    let methods: PaymentList;
    let name: string;
    let budgetEnabled = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        $createOrganization.paymentMethodId =
            methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    });

    async function handleSubmit() {
        try {
            const method = await submitStripeCard(name);
            $createOrganization.paymentMethodId = method.$id;
            invalidate(Dependencies.PAYMENT_METHODS);
        } catch (e) {
            console.log(e.message);
        }
    }

    $: if ($createOrganization.paymentMethodId === null && !$isStripeInitialized) {
        initializeStripe();
    }

    $: if ($createOrganization.paymentMethodId) {
        isStripeInitialized.set(false);
    }

    $: filteredMethods = methods?.paymentMethods.filter((method) => !!method?.last4);
</script>

<WizardStep beforeSubmit={handleSubmit}>
    <svelte:fragment slot="title">Payment details</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Add a payment method to your organization. You will not be charged until your trial ends on <b
            >{toLocaleDate(billingPayDate.toString())}</b
        >.
    </svelte:fragment>

    <p class="text"><b>Payment method</b></p>
    <FormList class="u-margin-block-start-8">
        <div class:boxes-wrapper={methods?.total}>
            {#if methods?.total}
                {#each filteredMethods as method}
                    <div class="box">
                        <InputRadio
                            id={`payment-method-${method.$id}`}
                            value={method.$id}
                            name="payment"
                            bind:group={$createOrganization.paymentMethodId}>
                            <span
                                class="u-flex u-cross-center u-gap-8"
                                style="padding-inline:0.25rem">
                                <span>
                                    <span class="u-capitalize">{method.brand}</span> ending in {method.last4}</span>
                                <CreditCardBrandImage brand={method.brand} />
                            </span>
                        </InputRadio>
                    </div>
                {/each}
            {/if}

            <div class="box">
                {#if methods?.total}
                    <InputRadio
                        id="payment-method"
                        value={null}
                        name="payment"
                        bind:group={$createOrganization.paymentMethodId}>
                        <span style="padding-inline:0.25rem">Add new payment method</span>
                    </InputRadio>
                {/if}
                {#if $createOrganization.paymentMethodId === null}
                    <FormList class="u-margin-block-start-8" gap={16}>
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
            fullWidth
            bind:value={budgetEnabled}>
            <p class="text">
                Restrict your resource usage by setting a budget cap. <button
                    class="link"
                    type="button"
                    on:click={() => ($showUsageRatesModal = true)}>
                    Learn more about usage rates</button
                >.
            </p>
            {#if budgetEnabled}
                <div class="u-margin-block-start-16">
                    <InputNumber
                        id="budget"
                        label="Budget cap ($USD)"
                        placeholder="0"
                        bind:value={$createOrganization.billingBudget} />
                </div>
            {/if}
        </InputChoice>
    </FormList>
</WizardStep>
