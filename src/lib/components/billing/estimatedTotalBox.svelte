<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { FormList, InputChoice, InputNumber } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    import { plansInfo, type Tier } from '$lib/stores/billing';

    export let billingPlan: Tier;
    export let collaborators: string[];
    export let couponData: Partial<Coupon>;
    export let billingBudget: number;
    export let fixedCoupon = false; // If true, the coupon cannot be removed

    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let budgetEnabled = false;

    $: currentPlan = $plansInfo.get(billingPlan);
    $: extraSeatsCost = (collaborators?.length ?? 0) * (currentPlan?.addons?.member?.price ?? 0);
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
    class="card u-margin-block-start-32 u-flex u-flex-vertical u-gap-8"
    style:--p-card-padding="1.5rem"
    style:--p-card-border-radius="var(--border-radius-small)">
    <span class="u-flex u-main-space-between">
        <p class="text">{currentPlan.name} plan</p>
        <p class="text">{formatCurrency(currentPlan.price)}</p>
    </span>
    <span class="u-flex u-main-space-between">
        <p class="text">Additional seats ({collaborators?.length})</p>
        <p class="text">
            {formatCurrency(extraSeatsCost)}
        </p>
    </span>
    {#if couponData?.status === 'active'}
        <span class="u-flex u-main-space-between">
            <div class="u-flex u-cross-center u-gap-4">
                <p class="text">
                    <span class="icon-tag u-color-text-success" aria-hidden="true" />
                    {#if couponData.credits >= 100}
                        {couponData.code.toUpperCase()}
                    {:else}
                        <span use:tooltip={{ content: couponData.code.toUpperCase() }}
                            >Credits applied</span>
                    {/if}
                </p>
                {#if !fixedCoupon}
                    <button
                        type="button"
                        class="button is-text is-only-icon"
                        style="--button-size:1.5rem;"
                        aria-label="Close"
                        title="Close"
                        on:click={() =>
                            (couponData = {
                                code: null,
                                status: null,
                                credits: null
                            })}>
                        <span class="icon-x" aria-hidden="true" />
                    </button>
                {/if}
            </div>
            {#if couponData.credits > 100}
                <p class="inline-tag" use:tooltip={{ content: formatCurrency(couponData.credits) }}>
                    Credits applied
                </p>
            {:else}
                <span class="u-color-text-success">-{formatCurrency(couponData.credits)}</span>
            {/if}
        </span>
    {/if}
    <div class="u-sep-block-start" />
    <span class="u-flex u-main-space-between">
        <p class="text">Estimated total</p>
        <p class="text">
            {formatCurrency(estimatedTotal)}
        </p>
    </span>

    <p class="text u-margin-block-start-16">
        Your payment method will be charged this amount plus usage fees every 30 days {!currentPlan.trialDays
            ? `starting ${toLocaleDate(billingPayDate.toString())}`
            : ` after your trial period ends on ${toLocaleDate(trialEndDate.toString())}`}.
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
