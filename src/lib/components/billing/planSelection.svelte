<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo, type Tier, tierFree, tierPro, tierScale } from '$lib/stores/billing';
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
                title={tierFree.name}
                tooltipText="You are limited to 1 Free organization per account."
                padding="m">
                <div
                    class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                    class:u-opacity-50={anyOrgFree || !selfService}>
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
            </LabelCard>
        </li>

        <li>
            <LabelCard
                name="plan"
                disabled={!selfService}
                bind:group={billingPlan}
                value={BillingPlan.PRO}
                title={tierPro.name}
                padding="m">
                <div
                    class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                    class:u-opacity-50={!selfService}>
                    <h4 class="body-text-2 u-bold">
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
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="plan"
                bind:group={billingPlan}
                value={BillingPlan.SCALE}
                title={tierScale.name}
                padding="m">
                <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                    <h4 class="body-text-2 u-bold">
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
            </LabelCard>
        </li>
    </ul>
{/if}
