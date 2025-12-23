<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { LabelCard } from '..';

    export let billingPlan: string;
    export let anyOrgFree = false;
    export let isNewOrg = false;
    let classes: string = '';
    export { classes as class };
</script>

{#if billingPlan}
    <ul class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-8 {classes}">
        {#each $plansInfo.values() as plan}
            <li>
                <LabelCard
                    name="plan"
                    bind:group={billingPlan}
                    disabled={(plan.$id === BillingPlan.FREE && anyOrgFree) || !plan.selfService}
                    value={plan.$id}
                    tooltipShow={plan.$id === BillingPlan.FREE && anyOrgFree}
                    tooltipText={plan.$id === BillingPlan.FREE
                        ? 'You are limited to 1 Free organization per account.'
                        : ''}>
                    <svelte:fragment slot="custom" let:disabled>
                        <div
                            class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                            class:u-opacity-50={disabled}>
                            <h4 class="body-text-2 u-bold">
                                {plan.name}
                                {#if $organization?.billingPlan === plan.$id && !isNewOrg}
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
