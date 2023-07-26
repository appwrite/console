<script lang="ts">
    import { FormList, InputNumber, InputRadio, InputText } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { changeOrganizationTier } from './store';
    import UsageRates from '../cloudOrganization/usageRates.svelte';
    import type { PaymentList } from '$lib/sdk/billing';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import { organization } from '$lib/stores/organization';

    let methods: PaymentList;
    let name: string;
    let budgetEnabled = false;
    let showRates = false;

    // let error: string;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        $changeOrganizationTier.paymentMethodId =
            $organization?.backupPaymentMethodId ?? methods.paymentMethods[0]?.$id ?? null;
    });

    async function handleSubmit() {
        try {
            await submitStripeCard(name);
            invalidate(Dependencies.PAYMENT_METHODS);
        } catch (e) {
            console.log(e.message);
        }
    }

    $: if ($changeOrganizationTier.paymentMethodId === null && !$isStripeInitialized) {
        initializeStripe();
    }

    $: if ($changeOrganizationTier.paymentMethodId) {
        isStripeInitialized.set(false);
    }

    $: filteredMethods = methods?.paymentMethods.filter((method) => !!method?.last4);
</script>

<WizardStep beforeSubmit={handleSubmit}>
    <svelte:fragment slot="title">Payment details</svelte:fragment>
    <svelte:fragment slot="subtitle">Add a payment method to your organization.</svelte:fragment>

    <FormList>
        <div class:boxes-wrapper={methods?.total}>
            {#if methods?.total}
                {#each filteredMethods as method}
                    <div class="box">
                        <InputRadio
                            id={`payment-method-${method.$id}`}
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
