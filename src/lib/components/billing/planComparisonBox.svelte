<script lang="ts">
    import { formatNum } from '$lib/helpers/string';
    import { plansInfo } from '$lib/stores/billing';
    import { SecondaryTabs, SecondaryTabsItem } from '..';

    let selectedTab: 'tier-0' | 'tier-1' = 'tier-0';
    export let downgrade = false;

    $: plan = $plansInfo.get(selectedTab);
</script>

<div class="card">
    <SecondaryTabs stretch>
        <SecondaryTabsItem
            disabled={selectedTab === 'tier-0'}
            on:click={() => (selectedTab = 'tier-0')}>
            Starter
        </SecondaryTabsItem>
        <SecondaryTabsItem
            disabled={selectedTab === 'tier-1'}
            on:click={() => (selectedTab = 'tier-1')}>
            Pro
        </SecondaryTabsItem>
    </SecondaryTabs>

    <div class="u-margin-block-start-24">
        {#if selectedTab === 'tier-0'}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            {#if downgrade}
                <ul class="u-margin-block-start-8 list u-gap-4 u-small">
                    <li class="list-item u-gap-4">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            Limited to {plan.databases} Database, {plan.buckets} Buckets, {plan.functions}
                            Functions per project
                        </span>
                    </li>
                    <li class="list-item u-gap-4">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text"> Limited to 1 organization member </span>
                    </li>
                    <li class="list-item u-gap-4">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            {plan.bandwidth}GB bandwidth
                        </span>
                    </li>
                    <li class="list-item u-gap-4">
                        <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                        <span class="text">
                            {plan.storage}GB storage
                        </span>
                    </li>
                    <li class="list-item u-gap-4">
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
        {:else if selectedTab === 'tier-1'}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            <ul class="un-order-list u-margin-block-start-8">
                <li>Everything in the Starter plan, plus:</li>
                <li>Unlimited databases, buckets, functions</li>
                <li>{plan.bandwidth}GB bandwidth</li>
                <li>{plan.storage}GB storage</li>
                <li>{formatNum(plan.executions)} executions</li>
                <li>Email support</li>
            </ul>
        {/if}
    </div>
</div>
