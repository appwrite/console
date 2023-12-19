<script lang="ts">
    import { FormList, InputNumber } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createOrganization } from './store';
    import type { PaymentList } from '$lib/sdk/billing';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import { sdk } from '$lib/stores/sdk';
    import { toLocaleDate } from '$lib/helpers/date';
    import { showUsageRatesModal } from '$lib/stores/billing';
    import { PaymentBoxes } from '$lib/components/billing';

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
        if ($createOrganization.billingBudget < 0) {
            throw new Error('Budget cannot be negative');
        }
        try {
            const method = await submitStripeCard(name);
            $createOrganization.paymentMethodId = method.$id;
            invalidate(Dependencies.PAYMENT_METHODS);
        } catch (e) {
            throw new Error('Something went wrong. Please try again.');
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

    <FormList class="u-margin-block-start-8">
        <PaymentBoxes
            methods={filteredMethods}
            bind:name
            bind:group={$createOrganization.paymentMethodId} />

        <InputChoice
            type="switchbox"
            id="budget"
            label="Enable budget cap"
            tooltip="If enabled, you will be notified by email when your organization spend reaches 75% of the cap you set. Update your budget cap alerts in organization Settings."
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
                        label="Budget cap (USD)"
                        placeholder="0"
                        min={0}
                        bind:value={$createOrganization.billingBudget} />
                </div>
            {/if}
        </InputChoice>
    </FormList>
</WizardStep>
