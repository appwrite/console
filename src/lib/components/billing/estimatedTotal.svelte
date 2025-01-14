<script lang="ts">
    // import { FormList, InputChoice } from "$lib/elements/forms";
    import { formatCurrency } from "$lib/helpers/numbers";
    import type { Estimation } from "$lib/sdk/billing";
    import { sdk } from "$lib/stores/sdk";
    import DiscountsApplied from "./discountsApplied.svelte";


    export let organizationId: string| undefined = undefined;
    export let billingPlan: string;
    export let collaborators: string[];
    export let couponId: string;
    export let fixedCoupon = false;

    var estimation: Estimation;

    let getEstimate = async (billingPlan, collaborators, couponId) => {
        try {

            estimation = await sdk.forConsole.billing.estimationCreateOrganization(billingPlan, (couponId == "") ? null : couponId, collaborators ?? []);
        } catch(e) {
            //
            console.log(e);
        }
    }

    let getUpdatePlanEstimate = async (organizationId, billingPlan, collaborators, couponId) => {
        try {
            estimation = await sdk.forConsole.billing.estimationUpdatePlan(organizationId, billingPlan, couponId && couponId.length > 0 ? couponId : null, collaborators ?? []);
        } catch (e) {
            console.log(e);
        }
    }

    $: organizationId && organizationId.length > 0 ? getUpdatePlanEstimate(organizationId, billingPlan, collaborators, couponId) : getEstimate(billingPlan, collaborators, couponId);

</script>

{#if estimation}

<section
    class="card u-flex u-flex-vertical u-gap-8"
    style:--p-card-padding="1.5rem"
    style:--p-card-border-radius="var(--border-radius-small)">
    <slot />
    {#each estimation.items ?? [] as item}
        <span class="u-flex u-main-space-between">
            <p class="text">{item.label}</p>
            <p class="text">{formatCurrency(item.value)}</p>
        </span>
    {/each}
    {#each estimation.discounts ?? [] as item}
        <DiscountsApplied {...item} />
    {/each}
    <div class="u-sep-block-start" />
    <span class="u-flex u-main-space-between">
        <p class="text">
            Total due<br />
        </p>
        <p class="text">
            {formatCurrency(estimation.grossAmount)}
        </p>
    </span>

    <!-- <p class="text u-margin-block-start-16">
        You'll pay <span class="u-bold">{formatCurrency(estimation.amount)}</span> now, with our first
        billing cycle starting on
        <span class="u-bold"
            >{!currentPlan.trialDays
                ? toLocaleDate(billingPayDate.toString())
                : toLocaleDate(trialEndDate.toString())}</span
        >. Once your credits run out, you'll be charged
        <span class="u-bold">{formatCurrency(currentPlan.price)}</span> plus usage fees every 30 days.
    </p> -->

    <!-- <FormList class="u-margin-block-start-24">
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
    </FormList> -->
</section>
{/if}