<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatNum } from '$lib/helpers/string';
    import { plansInfo, tierFree, tierPro, tierScale, type Tier } from '$lib/stores/billing';
    import { Card, SecondaryTabs, SecondaryTabsItem } from '..';

    let selectedTab: Tier = BillingPlan.FREE;
    export let downgrade = false;

    $: plan = $plansInfo.get(selectedTab);
</script>

<Card>
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
            <ul class="un-order-list u-margin-block-start-8">
                <li>Everything in the Free plan, plus:</li>
                <li>Unlimited databases, buckets, functions</li>
                <li>{plan.bandwidth}GB bandwidth</li>
                <li>{plan.storage}GB storage</li>
                <li>{formatNum(plan.executions)} executions</li>
                <li>Email support</li>
            </ul>
        {:else if selectedTab === BillingPlan.SCALE}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            <ul class="un-order-list u-margin-block-start-8">
                <li>Everything in the Pro plan, plus:</li>
                <li>Unlimited seats</li>
                <li>Organization roles</li>
                <li>SOC-2, BAA compliance</li>
                <li>SSO</li>
                <li>Priority support</li>
            </ul>
        {/if}
    </div>
</Card>
