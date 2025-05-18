<script lang="ts">
    import { InputChoice, InputNumber } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon, PlansMap } from '$lib/sdk/billing';
    import { type Tier } from '$lib/stores/billing';
    import { Card, Divider, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { CreditsApplied } from '.';

    export let billingPlan: Tier;
    export let collaborators: string[];
    export let couponData: Partial<Coupon>;
    export let plans: PlansMap;
    export let billingBudget: number;
    export let fixedCoupon = false; // If true, the coupon cannot be removed
    export let isDowngrade = false;

    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let budgetEnabled = false;

    $: currentPlan = plans.get(billingPlan);
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

<Card.Base padding="s">
    <Layout.Stack>
        <slot />
        <Layout.Stack direction="row" justifyContent="space-between">
            <Typography.Text>{currentPlan.name} plan</Typography.Text>
            <Typography.Text>{formatCurrency(currentPlan.price)}</Typography.Text>
        </Layout.Stack>
        <Layout.Stack direction="row" justifyContent="space-between">
            <Typography.Text variant={isDowngrade ? 'm-500' : 'm-400'}
                >Additional seats ({collaborators?.length ?? 0})</Typography.Text>
            <Typography.Text variant={isDowngrade ? 'm-500' : 'm-400'}
                >{formatCurrency(extraSeatsCost)}</Typography.Text>
        </Layout.Stack>
        {#if couponData?.status === 'active'}
            <CreditsApplied bind:couponData {fixedCoupon} />
        {/if}
        <Divider />
        <Layout.Stack direction="row" justifyContent="space-between">
            <Typography.Text>
                Upcoming charge<br />
                Due on {!currentPlan.trialDays
                    ? toLocaleDate(billingPayDate.toString())
                    : toLocaleDate(trialEndDate.toString())}</Typography.Text>
            <Typography.Text>{formatCurrency(estimatedTotal)}</Typography.Text>
        </Layout.Stack>

        <Typography.Text>
            You'll pay <b>{formatCurrency(estimatedTotal)}</b> now, with your first billing cycle
            starting on
            <b
                >{!currentPlan.trialDays
                    ? toLocaleDate(billingPayDate.toString())
                    : toLocaleDate(trialEndDate.toString())}</b
            >. {#if couponData?.status === 'active'}Once your credits run out, you'll be charged
                <b>{formatCurrency(currentPlan.price)}</b> plus usage fees every 30 days.
            {/if}
        </Typography.Text>

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
                        required
                        autofocus
                        id="budget"
                        label="Budget cap (USD)"
                        placeholder="0"
                        min={0}
                        bind:value={billingBudget} />
                </div>
            {/if}
        </InputChoice>
    </Layout.Stack>
</Card.Base>
