<script lang="ts">
    import { FormList, InputChoice, InputNumber } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    import { plansInfo, type Tier } from '$lib/stores/billing';
    import { CreditsApplied } from '.';

    export let billingPlan: Tier;
    export let collaborators: string[];
    export let couponData: Partial<Coupon>;
    export let billingBudget: number;
    export let fixedCoupon = false; // If true, the coupon cannot be removed
    export let isDowngrade = false;

    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let budgetEnabled = false;

    $: currentPlan = $plansInfo.get(billingPlan);
    $: extraSeatsCost = 0; // 0 untile trial period later replace (collaborators?.length ?? 0) * (currentPlan?.addons?.member?.price ?? 0);
    $: grossCost = currentPlan.price + extraSeatsCost;
    $: estimatedTotal =
        couponData?.status === 'active'
            ? grossCost - couponData.credits >= 0
                ? grossCost - couponData.credits
                : 0
            : grossCost;
    $: trialEndDate = new Date(
        billingPayDate.getTime() + currentPlan.trialDays * 24 * 60 * 60 * 1000
    );
</script>

<section
    class="card u-flex u-flex-vertical u-gap-8"
    style:--p-card-padding="1.5rem"
    style:--p-card-border-radius="var(--border-radius-small)">
    <slot />
    <span class="u-flex u-main-space-between">
        <p class="text">{currentPlan.name} plan</p>
        <p class="text">{formatCurrency(currentPlan.price)}</p>
    </span>
    <span class="u-flex u-main-space-between">
        <p class="text" class:u-bold={isDowngrade}>Additional seats ({collaborators?.length})</p>
        <p class="text" class:u-bold={isDowngrade}>
            {formatCurrency(extraSeatsCost)}
        </p>
    </span>
    {#if couponData?.status === 'active'}
        <CreditsApplied bind:couponData {fixedCoupon} />
    {/if}
    <div class="u-sep-block-start" />
    <span class="u-flex u-main-space-between">
        <p class="text">
            Upcoming charge<br /><span class="u-color-text-gray"
                >Due on {!currentPlan.trialDays
                    ? toLocaleDate(billingPayDate.toString())
                    : toLocaleDate(trialEndDate.toString())}</span>
        </p>
        <p class="text">
            {formatCurrency(estimatedTotal)}
        </p>
    </span>

    <p class="text u-margin-block-start-16">
        You'll pay <span class="u-bold">{formatCurrency(estimatedTotal)}</span> now, with your first
        billing cycle starting on
        <span class="u-bold"
            >{!currentPlan.trialDays
                ? toLocaleDate(billingPayDate.toString())
                : toLocaleDate(trialEndDate.toString())}</span
        >. Once your credits run out, you'll be charged
        <span class="u-bold">{formatCurrency(currentPlan.price)}</span> plus usage fees every 30 days.
    </p>

    <FormList class="u-margin-block-start-24">
        <InputChoice
            type="switchbox"
            id="budget"
            label="Enable budget cap"
            tooltip="If enabled, you will be notified when your spending reaches 75% of the set cap. Update cap alerts in your organization settings."
            fullWidth
            bind:value={budgetEnabled}>
            {#if budgetEnabled}
                <div class="u-margin-block-start-16">
                    <InputNumber
                        id="budget"
                        label="Budget cap (USD)"
                        placeholder="0"
                        min={0}
                        bind:value={billingBudget} />
                </div>
            {/if}
        </InputChoice>
    </FormList>
</section>
