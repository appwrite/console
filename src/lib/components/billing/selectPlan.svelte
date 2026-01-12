<script lang="ts">
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { LabelCard } from '..';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';

    export let billingPlan: string;
    export let anyOrgFree = false;
    export let isNewOrg = false;
    let classes: string = '';
    export { classes as class };

    function shouldDisable(plan: Models.BillingPlan) {
        return plan.group === BillingPlanGroup.Starter && anyOrgFree;
    }

    function shouldShowTooltip(plan: Models.BillingPlan) {
        if (plan.group !== BillingPlanGroup.Starter) return true;
        else return !anyOrgFree;
    }
</script>

{#if billingPlan}
    <ul class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-8 {classes}">
        {#each $plansInfo.values() as plan}
            <li>
                <LabelCard
                    name="plan"
                    bind:group={billingPlan}
                    disabled={!plan.selfService || shouldDisable(plan)}
                    value={plan.$id}
                    tooltipShow={shouldShowTooltip(plan)}
                    tooltipText={plan.group === BillingPlanGroup.Starter
                        ? 'You are limited to 1 Free organization per account.'
                        : ''}>
                    <svelte:fragment slot="custom" let:disabled>
                        <div
                            class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                            class:u-opacity-50={disabled}>
                            <h4 class="body-text-2 u-bold">
                                {plan.name}
                                {#if $organization?.billingPlanId === plan.$id && !isNewOrg}
                                    <span class="inline-tag">Current plan</span>
                                {/if}
                            </h4>
                            <p class="u-color-text-offline u-small">
                                {plan.desc}
                            </p>
                            <p>
                                {formatCurrency(plan?.price ?? 0)}
                            </p>
                        </div>
                    </svelte:fragment>
                </LabelCard>
            </li>
        {/each}
    </ul>
{/if}
