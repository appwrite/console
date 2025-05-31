<script lang="ts">
    import { InputChoice, InputNumber } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon, Estimation } from '$lib/sdk/billing';
    import { type Tier } from '$lib/stores/billing';
    import { Card, Divider, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { CreditsApplied } from '.';
    import { sdk } from '$lib/stores/sdk';
    import { AppwriteException } from '@appwrite.io/console';

    export let billingPlan: Tier;
    export let collaborators: string[];
    export let couponData: Partial<Coupon>;
    export let billingBudget: number;
    export let fixedCoupon = false; // If true, the coupon cannot be removed
    export let isDowngrade = false;
    export let organizationId: string | undefined = undefined;

    let budgetEnabled = false;
    let estimation: Estimation;

    async function getEstimate(
        billingPlan: string,
        collaborators: string[],
        couponId: string | undefined
    ) {
        try {
            estimation = await sdk.forConsole.billing.estimationCreateOrganization(
                billingPlan,
                couponId === '' ? null : couponId,
                collaborators ?? []
            );
        } catch (e) {
            if (e instanceof AppwriteException) {
                if (
                    e.type === 'billing_coupon_not_found' ||
                    e.type === 'billing_coupon_already_used' ||
                    e.type === 'billing_credit_unsupported'
                ) {
                    couponData = {
                        code: null,
                        status: null,
                        credits: null
                    };
                }
            }
        }
    }

    async function getUpdatePlanEstimate(
        organizationId: string,
        billingPlan: string,
        collaborators: string[],
        couponId: string | undefined
    ) {
        try {
            estimation = await sdk.forConsole.billing.estimationUpdatePlan(
                organizationId,
                billingPlan,
                couponId && couponId.length > 0 ? couponId : null,
                collaborators ?? []
            );
        } catch (e) {
            if (e instanceof AppwriteException) {
                if (
                    e.type === 'billing_coupon_not_found' ||
                    e.type === 'billing_coupon_already_used' ||
                    e.type === 'billing_credit_unsupported'
                ) {
                    couponData = {
                        code: null,
                        status: null,
                        credits: null
                    };
                }
            }
        }
    }

    $: organizationId
        ? getUpdatePlanEstimate(organizationId, billingPlan, collaborators, couponData?.code)
        : getEstimate(billingPlan, collaborators, couponData?.code);

    $: estimatedTotal =
        couponData?.status === 'active'
            ? estimation?.grossAmount - couponData.credits >= 0
                ? estimation?.grossAmount - couponData.credits
                : 0
            : estimation?.grossAmount;
</script>

{#if estimation}
    <Card.Base padding="s">
        <Layout.Stack>
            <slot />

            {#each estimation.items ?? [] as item}
                <Layout.Stack direction="row" justifyContent="space-between">
                    <Typography.Text variant={isDowngrade ? 'm-500' : 'm-400'}
                        >{item.label}</Typography.Text>
                    <Typography.Text variant={isDowngrade ? 'm-500' : 'm-400'}
                        >{formatCurrency(item.value)}</Typography.Text>
                </Layout.Stack>
            {/each}

            {#if couponData?.status === 'active'}
                <CreditsApplied bind:couponData {fixedCoupon} />
            {/if}
            <Divider />
            <Layout.Stack direction="row" justifyContent="space-between">
                <Typography.Text>Total due</Typography.Text>
                <Typography.Text>
                    {formatCurrency(estimatedTotal)}
                </Typography.Text>
            </Layout.Stack>

            <Typography.Text>
                You'll pay <b>{formatCurrency(estimatedTotal)}</b>
                now.
                {#if couponData?.code}Once your credits run out,{:else}Then{/if} you'll be charged
                <b>{formatCurrency(estimation.grossAmount)}</b> every 30 days.
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
{/if}
