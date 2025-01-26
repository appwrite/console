<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatNum } from '$lib/helpers/string';
    import { plansInfo, tierFree, tierPro, tierScale, type Tier } from '$lib/stores/billing';
    import { Card, SecondaryTabs, SecondaryTabsItem } from '..';

    let selectedTab: Tier = BillingPlan.FREE;
    export let downgrade = false;

    $: plan = $plansInfo.get(selectedTab);
</script>

<Card style="--card-padding: 1.5rem">
    <div class="comparison-box">
        <SecondaryTabs stretch>
            <SecondaryTabsItem
                disabled={selectedTab === BillingPlan.FREE}
                on:click={() => (selectedTab = BillingPlan.FREE)}>
                {tierFree.name}
            </SecondaryTabsItem>
            <SecondaryTabsItem
                disabled={selectedTab === BillingPlan.PRO}
                on:click={() => (selectedTab = BillingPlan.PRO)}>
                {tierPro.name}
            </SecondaryTabsItem>
            <SecondaryTabsItem
                disabled={selectedTab === BillingPlan.SCALE}
                on:click={() => (selectedTab = BillingPlan.SCALE)}>
                {tierScale.name}
            </SecondaryTabsItem>
        </SecondaryTabs>
    </div>

    <div class="u-margin-block-start-24">
        {#if selectedTab === BillingPlan.FREE}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            {#if downgrade}
                <ul class="u-margin-block-start-8 list u-gap-4 u-small">
                    <li class="list-item u-gap-4 u-cross-center">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            Limited to {plan.databases} Database, {plan.buckets} Buckets, {plan.functions}
                            Functions per project
                        </span>
                    </li>
                    <li class="list-item u-gap-4 u-cross-center">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text"> Limited to 1 organization member </span>
                    </li>
                    <li class="list-item u-gap-4 u-cross-center">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            {plan.bandwidth}GB bandwidth
                        </span>
                    </li>
                    <li class="list-item u-gap-4 u-cross-center">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            {plan.storage}GB storage
                        </span>
                    </li>
                    <li class="list-item u-gap-4 u-cross-center">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            {formatNum(plan.executions)} executions
                        </span>
                    </li>
                </ul>
            {:else}
                <ul class="u-margin-block-start-8 un-order-list">
                    <li>
                        <span class="text">
                            Limited to {plan.databases} Database, {plan.buckets} Buckets, {plan.functions}
                            Functions per project
                        </span>
                    </li>
                    <li>
                        <span class="text"> Limited to 1 organization member </span>
                    </li>
                    <li>
                        <span class="text">
                            {plan.bandwidth}GB bandwidth
                        </span>
                    </li>
                    <li>
                        <span class="text">
                            {plan.storage}GB storage
                        </span>
                    </li>
                    <li>
                        <span class="text">
                            {formatNum(plan.executions)} executions
                        </span>
                    </li>
                </ul>
            {/if}
        {:else if selectedTab === BillingPlan.PRO}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            <p class="u-margin-block-start-8">Everything in the Free plan, plus:</p>
            <ul class="un-order-list u-margin-inline-start-4">
                <li>Unlimited databases, buckets, functions</li>
                <li>{plan.bandwidth}GB bandwidth</li>
                <li>{plan.storage}GB storage</li>
                <li>{formatNum(plan.executions)} executions</li>
                <li>Email support</li>
            </ul>
        {:else if selectedTab === BillingPlan.SCALE}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            <p class="u-margin-block-start-8">Everything in the Pro plan, plus:</p>
            <ul class="un-order-list u-margin-inline-start-4">
                <li>Unlimited seats</li>
                <li>Organization roles</li>
                <li>SOC-2, HIPAA compliance</li>
                <li>SSO <span class="inline-tag">Coming soon</span></li>
                <li>Priority support</li>
            </ul>
        {/if}
    </div>
</Card>

<style lang="scss">
    .comparison-box {
        border-radius: var(--border-radius-small);
        background: hsl(var(--color-neutral-5));
    }
    :global(.theme-dark) .comparison-box {
        background: hsl(var(--color-neutral-85));
    }

    .comparison-box :global(.secondary-tabs-button:where(:disabled)) {
        background: hsl(var(--color-neutral-0));
        border: 1px solid hsl(var(--color-neutral-10));
    }
    :global(.theme-dark) .comparison-box :global(.secondary-tabs-button:where(:disabled)) {
        background: hsl(var(--color-neutral-80));
        border: 1px solid hsl(var(--color-neutral-85));
    }

    .inline-tag {
        line-height: 140%;
        font-weight: 500;
    }
</style>
