<script lang="ts">
    import { FormList, InputChoice, InputNumber } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon, Estimation } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { AppwriteException } from '@appwrite.io/console';
    import Card from '../card.svelte';
    import DiscountsApplied from './discountsApplied.svelte';
    import { addNotification } from '$lib/stores/notifications';

    export let organizationId: string | undefined = undefined;
    export let billingPlan: string;
    export let collaborators: string[];
    export let fixedCoupon = false;
    export let couponData: Partial<Coupon>;

    export let billingBudget: number;

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
            addNotification({
                type: 'error',
                isHtml: false,
                message: e.message
            });
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
            addNotification({
                type: 'error',
                isHtml: false,
                message: e.message
            });
        }
    }

    $: organizationId
        ? getUpdatePlanEstimate(organizationId, billingPlan, collaborators, couponData?.code)
        : getEstimate(billingPlan, collaborators, couponData?.code);
</script>

{#if estimation}
    <Card class="u-flex u-flex-vertical u-gap-8">
        <slot />
        {#if estimation}
            {#each estimation.items ?? [] as item}
                {#if item.value > 0}
                    <span class="u-flex u-main-space-between">
                        <p class="text">{item.label}</p>
                        <p class="text">{formatCurrency(item.value)}</p>
                    </span>
                {/if}
            {/each}
            {#each estimation.discounts ?? [] as item}
                <DiscountsApplied {fixedCoupon} bind:couponData {...item} />
            {/each}
            <div class="u-sep-block-start" />
            <span class="u-flex u-main-space-between">
                <p class="text">Total due</p>
                <p class="text">
                    {formatCurrency(estimation.grossAmount)}
                </p>
            </span>

            <p class="text u-margin-block-start-16">
                You'll pay <span class="u-bold">{formatCurrency(estimation.grossAmount)}</span> now.
                {#if couponData?.code}Once your credits run out,{:else}Then{/if} you'll be charged
                <span class="u-bold">{formatCurrency(estimation.amount)}</span> every 30 days.
            </p>
        {/if}

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
    </Card>
{/if}
