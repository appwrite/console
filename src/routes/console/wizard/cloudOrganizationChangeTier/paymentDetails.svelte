<script lang="ts">
    import { Button, FormList, InputNumber } from '$lib/elements/forms';
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
    import { showUsageRatesModal } from '$lib/stores/billing';
    import { PaymentBoxes } from '$lib/components/billing';
    import FeedbackModal from '$lib/components/feedback/feedbackModal.svelte';
    import { Alert } from '$lib/components';

    let methods: PaymentList;
    let filteredMethods: PaymentMethodData[];
    let name: string;
    let budgetEnabled = false;
    let initialPaymentMethodId: string;
    let showIndianMandateAlert = false;
    let showContactUs = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        filteredMethods = methods?.paymentMethods.filter((method) => !!method?.last4);

        initialPaymentMethodId =
            $organization?.paymentMethodId ??
            $organization?.backupPaymentMethodId ??
            filteredMethods[0]?.$id ??
            null;
        $changeOrganizationTier.paymentMethodId = initialPaymentMethodId;
        $changeOrganizationTier.billingBudget = $organization?.billingBudget;
        budgetEnabled = !!$organization?.billingBudget;

        const locale = await sdk.forProject.locale.get();
        if (locale.countryCode === 'in') {
            showIndianMandateAlert = true;
        }
    });

    async function handleSubmit() {
        if ($changeOrganizationTier.billingBudget < 0) {
            throw new Error('Budget cannot be negative');
        }
        if ($changeOrganizationTier.paymentMethodId) {
            const card = await sdk.forConsole.billing.getPaymentMethod(
                $changeOrganizationTier.paymentMethodId
            );
            if (!card?.last4) {
                throw new Error(
                    'The payment method you selected is not valid. Please select a different one.'
                );
            }
        } else {
            try {
                await submitStripeCard(name);
                const latestMethods = await sdk.forConsole.billing.listPaymentMethods();
                const paymentMethod = symmetricDifference(
                    methods.paymentMethods,
                    latestMethods.paymentMethods
                )[0] as PaymentMethodData;
                const card = await sdk.forConsole.billing.getPaymentMethod(paymentMethod.$id);
                if (card?.last4) {
                    $changeOrganizationTier.paymentMethodId = paymentMethod.$id;
                } else {
                    throw new Error(
                        'The payment method you selected is not valid. Please select a different one.'
                    );
                }

                invalidate(Dependencies.PAYMENT_METHODS);
            } catch (e) {
                throw new Error(e.message);
            }
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
    {#if !showIndianMandateAlert}
        <Alert type="warning" class="u-margin-block-start-8">
            <svelte:fragment slot="title">Indian credit or debit card-holders</svelte:fragment>
            To comply with RBI regulations in India, Appwrite will ask for verification to charge up
            to $150 USD on your payment method. We will never charge more than the cost of your plan
            and the resources you use, or your budget cap limit. For higher usage limits, <Button
                link
                on:click={() => (showContactUs = true)}>please contact us.</Button>
        </Alert>
    {/if}

    <FormList
        class={!showIndianMandateAlert ? 'u-margin-block-start-16' : 'u-margin-block-start-8'}>
        <PaymentBoxes
            methods={filteredMethods}
            bind:name
            bind:group={$changeOrganizationTier.paymentMethodId} />

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
                        bind:value={$changeOrganizationTier.billingBudget} />
                </div>
            {/if}
        </InputChoice>
    </FormList>
</WizardStep>

<FeedbackModal bind:show={showContactUs} />
