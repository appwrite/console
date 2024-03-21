<script lang="ts">
    import { Box, CreditCardBrandImage } from '$lib/components';
    import { CouponInput } from '$lib/components/billing';
    import { BillingPlan } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { WizardStep } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { plansInfo } from '$lib/stores/billing';
    import { sdk } from '$lib/stores/sdk';
    import { TRIAL_PERIOD_OVERRIDE } from '$lib/system';
    import { createOrganization, createOrganizationFinalAction } from './store';

    const plan = $plansInfo?.get($createOrganization.billingPlan);
    const collaboratorPrice = plan?.addons.member?.price ?? 0;
    const collaboratorsNumber = $createOrganization?.collaborators?.length ?? 0;
    const totalExpences = plan.price + collaboratorPrice * collaboratorsNumber;
    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 44 * 24 * 60 * 60 * 1000);

    let coupon: string = null;
    let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

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
        Confirm the details of your new organization{TRIAL_PERIOD_OVERRIDE
            ? '.'
            : ' and start your free trial.'}
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
            <CouponInput
                bind:coupon
                bind:couponData
                on:validation={(e) => ($createOrganization.couponCode = e.detail.code)} />
            <span class="u-flex u-main-space-between">
                <p class="text">{plan.name} plan</p>
                <p class="text">{formatCurrency(plan.price)}</p>
            </span>
            <span class="u-flex u-main-space-between">
                <p class="text">Additional members ({collaboratorsNumber})</p>
                <p class="text">{formatCurrency(collaboratorPrice * collaboratorsNumber)}</p>
            </span>
            {#if couponData?.status === 'active'}
                <span class="u-flex u-main-space-between">
                    <p class="text">Credits applied ({couponData.credits})</p>
                    <p class="text">-{formatCurrency(couponData.credits)}</p>
                </span>
            {/if}
            <div class="u-sep-block-start" />
        {/if}
        {@const estimatedTotal =
            couponData?.status === 'active'
                ? totalExpences - couponData.credits >= 0
                    ? totalExpences - couponData.credits
                    : 0
                : totalExpences}
        <span class="u-flex u-main-space-between">
            <p class="text">Estimated total</p>
            <p class="text">
                {formatCurrency(estimatedTotal)}
            </p>
        </span>

        {#if $createOrganization.billingPlan !== BillingPlan.STARTER}
            <p class="text u-margin-block-start-16">
                This amount, and any additional usage fees, will be charged on a recurring 30-day
                billing cycle{TRIAL_PERIOD_OVERRIDE
                    ? '.'
                    : ` after your trial period ends on ${toLocaleDate(billingPayDate.toString())}`}.
            </p>
        {/if}
    </Box>
</WizardStep>
