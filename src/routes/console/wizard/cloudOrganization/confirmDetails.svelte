<script lang="ts">
    import { Box, CreditCardBrandImage } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { toLocaleDate } from '$lib/helpers/date';
    import { WizardStep } from '$lib/layout';
    import { plansInfo } from '$lib/stores/billing';
    import { sdk } from '$lib/stores/sdk';
    import { createOrganization, createOrganizationFinalAction } from './store';

    const plan = $plansInfo.plans.find((p) => p.$id === $createOrganization.billingPlan);
    const collaboratorPrice = plan?.addons.member?.price ?? 0;
    const collaboratorsNumber = $createOrganization?.collaborators?.length ?? 0;
    const totalExpences = plan.price + collaboratorPrice * collaboratorsNumber;
    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 44 * 24 * 60 * 60 * 1000);

    async function fetchCard() {
        try {
            const card = await sdk.forConsole.billing.getPaymentMethod(
                $createOrganization.paymentMethodId
            );
            return card;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function handleBefore() {
        if (!$createOrganization.billingPlan) {
            throw new Error('Please select a plan.');
        }
        if ($createOrganization.billingPlan === BillingPlan.STARTER) {
            $createOrganization.collaborators = [];
        }
    }

    $: if ($createOrganization.billingPlan === BillingPlan.STARTER) {
        $createOrganizationFinalAction = 'Create organization';
    }
</script>

<WizardStep beforeSubmit={handleBefore}>
    <svelte:fragment slot="title">Confirm your details</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Confirm the details of your new organization and start your free trial.
    </svelte:fragment>

    <p class="body-text-1 u-bold">Organization name</p>
    <div class="u-flex u-gap-8 u-cross-center u-margin-block-start-8">
        <p class="text">{$createOrganization.name}</p>
        {#if $createOrganization?.id}
            <Pill>{$createOrganization.id}</Pill>
        {/if}
    </div>

    {#if $createOrganization.billingPlan !== BillingPlan.STARTER}
        <div class="u-margin-block-start-32">
            <p class="body-text-1 u-bold">Additional members</p>
            <p class="text u-margin-block-start-8">{collaboratorsNumber} members</p>
        </div>
        <div class="u-margin-block-start-32">
            <p class="body-text-1 u-bold">Payment</p>
            {#await fetchCard()}
                <div class="u-flex u-margin-block-start-8">
                    <div class="loader is-small" />
                </div>
            {:then card}
                <span class="u-flex u-cross-center u-gap-8 u-margin-block-start-8">
                    <p class="text">
                        <span class="u-capitalize">{card?.brand}</span> ending in {card?.last4}
                    </p>
                    <CreditCardBrandImage brand={card?.brand} />
                </span>
            {/await}
        </div>
    {/if}
    <Box class="u-margin-block-start-32 u-flex u-flex-vertical u-gap-16" radius="small">
        {#if $createOrganization.billingPlan !== BillingPlan.STARTER}
            <span class="u-flex u-main-space-between">
                <p class="text">{plan.name} plan</p>
                <p class="text">${plan.price}</p>
            </span>
            <span class="u-flex u-main-space-between">
                <p class="text">Additional members ({collaboratorsNumber})</p>
                <p class="text">${collaboratorPrice * collaboratorsNumber}</p>
            </span>
            <div class="u-sep-block-start" />
        {/if}
        <span class="u-flex u-main-space-between">
            <p class="text">Estimated total</p>
            <p class="text">${totalExpences}</p>
        </span>

        {#if $createOrganization.billingPlan !== BillingPlan.STARTER}
            <p class="text u-margin-block-start-16">
                This amount, and any additional usage fees, will be charged on a recurring 30-day
                billing cycle after your trial period ends on <b
                    >{toLocaleDate(billingPayDate.toString())}</b
                >.
            </p>
        {/if}
    </Box>
</WizardStep>
