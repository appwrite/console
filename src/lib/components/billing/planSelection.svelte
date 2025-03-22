<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo, tierFree, tierPro, tierScale, type Tier } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { LabelCard } from '..';

    export let billingPlan: Tier;
    export let anyOrgFree = false;
    export let isNewOrg = false;
    export let selfService = true;
    let classes: string = '';
    export { classes as class };

    $: freePlan = $plansInfo.get(BillingPlan.FREE);
    $: proPlan = $plansInfo.get(BillingPlan.PRO);
    $: scalePlan = $plansInfo.get(BillingPlan.SCALE);
</script>

{#if billingPlan}
    <ul class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-8 {classes}">
        <li>
            <LabelCard
                name="plan"
                bind:group={billingPlan}
                disabled={anyOrgFree || !selfService}
                value={BillingPlan.FREE}
                tooltipShow={anyOrgFree}
                tooltipText="You are limited to 1 Free organization per account."
                padding={1.5}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierFree.name}
                            {#if $organization?.billingPlan === BillingPlan.FREE && !isNewOrg}
                                <span class="inline-tag">Current plan</span>
                            {/if}
                        </h4>
                        <p class="u-color-text-offline u-small">
                            {tierFree.description}
                        </p>
                        <p>
                            {formatCurrency(freePlan?.price ?? 0)}
                        </p>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>

        <li>
            <LabelCard
                name="plan"
                disabled={!selfService}
                bind:group={billingPlan}
                value={BillingPlan.PRO}
                padding={1.5}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierPro.name}
                            {#if $organization?.billingPlan === BillingPlan.PRO && !isNewOrg}
                                <span class="inline-tag">Current plan</span>
                            {/if}
                        </h4>
                        <p class="u-color-text-offline u-small">
                            {tierPro.description}
                        </p>
                        <p>
                            {formatCurrency(proPlan?.price ?? 0)} per member/month + usage
                        </p>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="plan"
                bind:group={billingPlan}
                value={BillingPlan.SCALE}
                padding={1.5}
                disabled={!selfService}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierScale.name}
                            {#if $organization?.billingPlan === BillingPlan.SCALE && !isNewOrg}
                                <span class="inline-tag">Current plan</span>
                            {/if}
                        </h4>
                        <p class="u-color-text-offline u-small">
                            {tierScale.description}
                        </p>
                        <p>
                            {formatCurrency(scalePlan?.price ?? 0)} per month + usage
                        </p>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
    </ul>
{/if}
