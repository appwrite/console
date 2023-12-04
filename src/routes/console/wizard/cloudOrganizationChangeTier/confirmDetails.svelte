<script lang="ts">
    import { Box, CreditCardBrandImage } from '$lib/components';
    import { CouponInput } from '$lib/components/billing';
    import { Pill } from '$lib/elements';
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { WizardStep } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { plansInfo } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { changeOrganizationFinalAction, changeOrganizationTier, isUpgrade } from './store';

    const plan = $plansInfo.plans.find((p) => p.$id === $changeOrganizationTier.billingPlan);
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
    let comment: string = null;

    async function fetchCard() {
        try {
            const card = await sdk.forConsole.billing.getPaymentMethod(
                $changeOrganizationTier.paymentMethodId
            );
            return card;
        } catch (error) {
            console.log(error);
        }
    }

    $: downgradeToStarter = $changeOrganizationTier.billingPlan === 'tier-0';
    $: if (!$isUpgrade) {
        $changeOrganizationFinalAction = 'Confirm plan change';
    }
</script>

{#if downgradeToStarter}
    <WizardStep>
        <svelte:fragment slot="title">Confirm plan change</svelte:fragment>
        <svelte:fragment slot="subtitle">
            Your feedback is important to us and helps us improve the services Appwrite offer. If
            there is a specific reason you chose to change your plan at this time, please let us
            know.
        </svelte:fragment>
        <FormList>
            <InputTextarea
                id="comment"
                label="Your feedback here"
                placeholder="This is my reason for downgrading..."
                bind:value={comment} />
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
            {#if $changeOrganizationTier?.id}
                <Pill>{$changeOrganizationTier.id}</Pill>
            {/if}
        </div>

        {#if $changeOrganizationTier.billingPlan !== 'tier-0'}
            <div class="u-margin-block-start-32">
                <p class="body-text-1 u-bold">Organization members</p>
                <p class="text u-margin-block-start-8">{collaboratorsNumber} members invited</p>
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
            <CouponInput bind:coupon bind:couponData />
            {#if $changeOrganizationTier.billingPlan !== 'tier-0'}
                <span class="u-flex u-main-space-between">
                    <p class="text">{plan.name} plan</p>
                    <p class="text">${plan.price}</p>
                </span>
                <span class="u-flex u-main-space-between">
                    <p class="text">Additional members ({collaboratorsNumber})</p>
                    <p class="text">${collaboratorPrice * collaboratorsNumber}</p>
                </span>
                {#if couponData?.status === 'active'}
                    <span class="u-flex u-main-space-between">
                        <p class="text">Credits applied ({couponData.credits})</p>
                        <p class="text">-${couponData.credits}</p>
                    </span>
                {/if}
            {/if}
            <div class="u-sep-block-start" />
            <span class="u-flex u-main-space-between">
                <p class="text">Estimated total (in USD)</p>
                <p class="text">
                    ${couponData?.status === 'active'
                        ? totalExpences - couponData.credits || 0
                        : totalExpences}
                </p>
            </span>

            <p class="text u-margin-block-start-16">
                This amount and any additional usage fees will be charged on a recurring 30 day
                billing cycle after your trial period ends on <b
                    >{toLocaleDate(billingPayDate.toString())}</b
                >.
            </p>
        </Box>
    </WizardStep>
{/if}
