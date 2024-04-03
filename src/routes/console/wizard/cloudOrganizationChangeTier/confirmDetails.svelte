<script lang="ts">
    import { Alert, Box, CreditCardBrandImage } from '$lib/components';
    import { CouponInput } from '$lib/components/billing';
    import { BillingPlan } from '$lib/constants';
    import { FormList, InputSelect, InputTextarea } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { WizardStep } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import {
        changeOrganizationFinalAction,
        changeOrganizationTier,
        feedbackDowngradeOptions,
        isUpgrade
    } from './store';

    const plan = $plansInfo.get($changeOrganizationTier.billingPlan);
    const collaboratorPrice = plan?.addons.member?.price ?? 0;
    const collaboratorsNumber = $changeOrganizationTier?.collaborators?.length ?? 0;
    const totalExpences = plan.price + collaboratorPrice * collaboratorsNumber;
    const today = new Date();

    $: billingPayDate = $isUpgrade
        ? new Date(today.getTime() + 44 * 24 * 60 * 60 * 1000)
        : $organization.billingCurrentInvoiceDate;

    let coupon: string = null;
    let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    async function fetchCard() {
        try {
            const card = await sdk.forConsole.billing.getPaymentMethod(
                $changeOrganizationTier.paymentMethodId
            );
            return card;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    $: downgradeToStarter = $changeOrganizationTier.billingPlan === BillingPlan.STARTER;
    $: if (!$isUpgrade) {
        $changeOrganizationFinalAction = 'Confirm plan change';
    }
</script>

{#if downgradeToStarter}
    <WizardStep>
        <svelte:fragment slot="title">Confirm plan change</svelte:fragment>
        <svelte:fragment slot="subtitle">
            Your feedback is important to us and helps us improve the services Appwrite offers.
            Please let us know if there is a specific reason for changing your plan.
        </svelte:fragment>

        <Alert>
            <svelte:fragment slot="title"
                >Your {tierToPlan($organization.billingPlan).name} plan subscription will end on {toLocaleDate(
                    $organization.billingCurrentInvoiceDate
                )}</svelte:fragment>
            <p class="text">
                Following the payment of your final invoice on {toLocaleDate(
                    $organization.billingCurrentInvoiceDate
                )}, your organization will switch to the {tierToPlan(
                    $changeOrganizationTier.billingPlan
                ).name} plan. Until then, you can continue to use the resources available to the {tierToPlan(
                    $organization.billingPlan
                ).name} plan.
            </p>
        </Alert>
        <FormList class="u-margin-block-start-24">
            <InputSelect
                id="reason"
                label="Reason for plan change"
                placeholder="Select one"
                required
                options={feedbackDowngradeOptions}
                bind:value={$changeOrganizationTier.feedbackDowngradeReason} />
            <InputTextarea
                id="comment"
                label="If you would like to elaborate, please do so here"
                placeholder="Enter feedback"
                bind:value={$changeOrganizationTier.feedbackMessage} />
        </FormList>
    </WizardStep>
{:else}
    <WizardStep>
        <svelte:fragment slot="title">Confirm your details</svelte:fragment>
        <svelte:fragment slot="subtitle">
            Confirm the details of your new organization and start your free trial.
        </svelte:fragment>

        <p class="body-text-1 u-bold">Organization name</p>
        <div class="u-flex u-gap-8 u-cross-center u-margin-block-start-8">
            <p class="text">{$organization.name}</p>
        </div>

        {#if $changeOrganizationTier.billingPlan !== BillingPlan.STARTER}
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
                            Card ending in {card.last4}
                        </p>
                        <CreditCardBrandImage brand={card.brand}></CreditCardBrandImage>
                    </span>
                {/await}
            </div>
        {/if}

        <Box class="u-margin-block-start-32 u-flex u-flex-vertical u-gap-16" radius="small">
            {#if $changeOrganizationTier.billingPlan !== BillingPlan.STARTER}
                <CouponInput
                    bind:coupon
                    bind:couponData
                    on:validation={(e) => ($changeOrganizationTier.couponCode = e.detail.code)} />
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
            {/if}
            {@const estimatedTotal =
                couponData?.status === 'active'
                    ? totalExpences - couponData.credits >= 0
                        ? totalExpences - couponData.credits
                        : 0
                    : totalExpences}
            <div class="u-sep-block-start" />
            <span class="u-flex u-main-space-between">
                <p class="text">Estimated total</p>
                <p class="text">
                    {formatCurrency(estimatedTotal)}
                </p>
            </span>

            <p class="text u-margin-block-start-16">
                This amount, and any additional usage fees, will be charged on a recurring 30-day
                billing cycle after your trial period ends on <b
                    >{toLocaleDate(billingPayDate.toString())}</b
                >.
            </p>
        </Box>
    </WizardStep>
{/if}
