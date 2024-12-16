<script lang="ts">
    import { FormList, InputChoice, InputNumber } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    import { plansInfo, type Tier } from '$lib/stores/billing';
    import { CreditsApplied } from '.';
    import { BillingPlan } from '$lib/constants';
    import { tooltip } from '$lib/actions/tooltip';

    // undefined as we only need this on `change-plan`
    export let currentTier: Tier | undefined = undefined;
    export let billingPlan: Tier;
    export let collaborators: string[];
    export let couponData: Partial<Coupon>;
    export let billingBudget: number;
    export let fixedCoupon = false; // If true, the coupon cannot be removed
    export let isDowngrade = false;

    const today = new Date();
    const isScaleDowngrade = isDowngrade && billingPlan === BillingPlan.PRO;
    const isScaleUpgrade = !isDowngrade && billingPlan === BillingPlan.SCALE;
    const billingPayDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let budgetEnabled = false;

    $: selectedPlan = $plansInfo.get(billingPlan);
    $: currentOrgPlan = $plansInfo.get(currentTier);
    $: unUsedBalances = isScaleUpgrade
        ? currentOrgPlan.price +
          (collaborators?.length ?? 0) * (currentOrgPlan?.addons?.member?.price ?? 0)
        : isScaleDowngrade
          ? currentOrgPlan.price
          : 0;

    $: extraSeatsCost = (collaborators?.length ?? 0) * (selectedPlan?.addons?.member?.price ?? 0);
    $: grossCost =
        isScaleUpgrade || isScaleDowngrade
            ? selectedPlan.price + extraSeatsCost - unUsedBalances
            : selectedPlan.price + extraSeatsCost;
    $: estimatedTotal =
        couponData?.status === 'active' ? Math.max(0, grossCost - couponData.credits) : grossCost;
    $: trialEndDate = new Date(
        billingPayDate.getTime() + selectedPlan.trialDays * 24 * 60 * 60 * 1000
    );

    $: isRefund = isScaleDowngrade && grossCost < 0;
</script>

<section
    class="card u-flex u-flex-vertical u-gap-8"
    style:--p-card-padding="1.5rem"
    style:--p-card-border-radius="var(--border-radius-small)">
    <slot />
    <div class="u-flex u-main-space-between">
        <p class="text">{selectedPlan.name} plan</p>
        <p class="text">{formatCurrency(selectedPlan.price)}</p>
    </div>

    <div class="u-flex u-main-space-between">
        <p class="text" class:u-bold={isDowngrade}>Additional seats ({collaborators?.length})</p>
        <p class="text" class:u-bold={isDowngrade}>
            {formatCurrency(
                isScaleDowngrade
                    ? (collaborators?.length ?? 0) * (selectedPlan?.addons?.member?.price ?? 0)
                    : extraSeatsCost
            )}
        </p>
    </div>

    {#if isScaleUpgrade}
        {@const currentPlanName = currentOrgPlan.name}
        <div class="u-flex u-main-space-between">
            <div class="text">
                <span>Unused {currentPlanName} plan balance</span>
                <span
                    use:tooltip={{
                        placement: 'bottom',
                        content: `This discount reflects the unused portion of your ${currentPlanName} plan and add-ons. Future credits for extra seats and features will apply automatically.`
                    }}
                    class="icon-info">
                </span>
            </div>
            <p class="text">-{formatCurrency(unUsedBalances)}</p>
        </div>
    {:else if isScaleDowngrade}
        <div class="u-flex u-main-space-between">
            <span>Unused {currentOrgPlan.name} plan balance</span>
            <p class="text">-{formatCurrency(currentOrgPlan.price)}</p>
        </div>
    {/if}

    {#if couponData?.status === 'active'}
        <CreditsApplied bind:couponData {fixedCoupon} />
    {/if}
    <div class="u-sep-block-start" />
    <div class="u-flex u-main-space-between">
        <p class="text">
            Upcoming charge<br /><span class="u-color-text-gray"
                >Due on {!selectedPlan.trialDays
                    ? toLocaleDate(billingPayDate.toString())
                    : toLocaleDate(trialEndDate.toString())}</span>
        </p>
        <p class="text">
            {formatCurrency(estimatedTotal)}
        </p>
    </div>

    <p class="text u-margin-block-start-16">
        You'll {isRefund ? 'receive a refund of' : 'pay'}
        <span class="u-bold">{formatCurrency(estimatedTotal)}</span>
        now, with our first billing cycle starting on
        <span class="u-bold"
            >{!selectedPlan.trialDays
                ? toLocaleDate(billingPayDate.toString())
                : toLocaleDate(trialEndDate.toString())}</span
        >. Once your credits run out, you'll be charged
        <span class="u-bold">{formatCurrency(selectedPlan.price)}</span> plus usage fees every 30 days.
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
