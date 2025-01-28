<script lang="ts">
    import { FormList, InputChoice, InputNumber } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon, Estimation } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import Alert from '../alert.svelte';
    import Card from '../card.svelte';
    import DiscountsApplied from './discountsApplied.svelte';

    export let organizationId: string | undefined = undefined;
    export let billingPlan: string;
    export let collaborators: string[];
    export let couponId: string;
    export let fixedCoupon = false;
    export let error = '';
    export let couponData: Partial<Coupon>;

    export let billingBudget: number;

    let budgetEnabled = false;
    let estimation: Estimation;

    async function getEstimate(billingPlan: string, collaborators: string[], couponId: string) {
        try {
            error = '';
            estimation = await sdk.forConsole.billing.estimationCreateOrganization(
                billingPlan,
                couponId === '' ? null : couponId,
                collaborators ?? []
            );
            error = estimation.error ?? '';
        } catch (e) {
            error = e.message;
        }
    }

    async function getUpdatePlanEstimate(
        organizationId: string,
        billingPlan: string,
        collaborators: string[],
        couponId: string | undefined
    ) {
        try {
            error = '';
            estimation = await sdk.forConsole.billing.estimationUpdatePlan(
                organizationId,
                billingPlan,
                couponId && couponId.length > 0 ? couponId : null,
                collaborators ?? []
            );
            error = estimation.error ?? '';
        } catch (e) {
            error = e.message;
        }
    }

    $: organizationId
        ? getUpdatePlanEstimate(organizationId, billingPlan, collaborators, couponId)
        : getEstimate(billingPlan, collaborators, couponId);
</script>

{#if estimation || error.length}
    <Card class="u-flex u-flex-vertical u-gap-8">
        {#if error.length}
            <Alert type="error">
                {error}
            </Alert>
        {/if}

        {#if estimation}
            {#each estimation.items ?? [] as item}
                <span class="u-flex u-main-space-between">
                    <p class="text">{item.label}</p>
                    <p class="text">{formatCurrency(item.value)}</p>
                </span>
            {/each}
            {#each estimation.discounts ?? [] as item}
                <DiscountsApplied bind:couponData {...item} />
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
                Once your credits run out, you'll be charged
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
