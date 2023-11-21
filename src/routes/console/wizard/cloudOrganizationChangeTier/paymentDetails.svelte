<script lang="ts">
    import { FormList, InputNumber, InputRadio, InputText } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { changeOrganizationTier } from './store';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import { organization } from '$lib/stores/organization';
    import { symmetricDifference } from '$lib/helpers/array';
    import { CreditCardBrandImage } from '$lib/components';
    import { showUsageRatesModal } from '$lib/stores/billing';

    let methods: PaymentList;
    let filteredMethods: PaymentMethodData[];
    let name: string;
    let budgetEnabled = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        filteredMethods = methods?.paymentMethods.filter((method) => !!method?.last4);

        $changeOrganizationTier.paymentMethodId =
            $organization?.paymentMethodId ??
            $organization?.backupPaymentMethodId ??
            filteredMethods[0]?.$id ??
            null;
        $changeOrganizationTier.billingBudget = $organization?.billingBudget;
        budgetEnabled = !!$organization?.billingBudget;
    });

    async function handleSubmit() {
        try {
            await submitStripeCard(name);
            const latestMethods = await sdk.forConsole.billing.listPaymentMethods();
            const paymentMethod = symmetricDifference(
                methods.paymentMethods,
                latestMethods.paymentMethods
            )[0] as PaymentMethodData;

            console.log(paymentMethod);
            $changeOrganizationTier.paymentMethodId = paymentMethod.$id;
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

    $: if (!budgetEnabled) {
        $changeOrganizationTier.billingBudget = null;
    }
</script>

<WizardStep beforeSubmit={handleSubmit}>
    <svelte:fragment slot="title">Payment details</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Confirm the payment method for your organization.
    </svelte:fragment>

    <FormList>
        <div class:boxes-wrapper={filteredMethods?.length}>
            {#if filteredMethods?.length}
                {#each filteredMethods as method}
                    <div class="box">
                        <InputRadio
                            id={`payment-method-${method.$id}`}
                            value={method.$id}
                            name="payment"
                            bind:group={$changeOrganizationTier.paymentMethodId}>
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
                {#if filteredMethods?.length}
                    <InputRadio
                        id="payment-method"
                        value={null}
                        name="payment"
                        bind:group={$changeOrganizationTier.paymentMethodId}>
                        <span style="padding-inline:0.25rem">Add new payment method</span>
                    </InputRadio>
                {/if}
                {#if $changeOrganizationTier.paymentMethodId === null}
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
                        bind:value={$changeOrganizationTier.billingBudget} />
                </div>
            {/if}
        </InputChoice>
    </FormList>
</WizardStep>
