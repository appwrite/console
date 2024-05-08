<script lang="ts">
    import { formatNum } from '$lib/helpers/string';
    import { plansInfo } from '$lib/stores/billing';
    import { Box, SecondaryTabs, SecondaryTabsItem } from '..';

    let selectedTab: 'tier-0' | 'tier-1' = 'tier-0';

    $: plan = $plansInfo.get(selectedTab);
</script>

<Box>
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
            <ul class="list u-margin-block-start-8">
                <li class="list-item">
                    Limited to {plan.databases} Database, {plan.buckets} Buckets, {plan.functions} Functions
                    per project
                </li>
                <li class="list-item">Limited to 1 organization member</li>
                <li class="list-item">{plan.bandwidth}GB bandwidth</li>
                <li class="list-item">{plan.storage}GB storage</li>
                <li class="list-item">{formatNum(plan.executions)} executions</li>
            </ul>
        {:else if selectedTab === 'tier-1'}
            <h3 class="u-bold body-text-1">{plan.name} plan</h3>
            <ul class="list u-margin-block-start-8">
                <li class="list-item">Everything in the Starter plan, plus:</li>
                <li class="list-item">Unlimited databases, buckets, functions</li>
                <li class="list-item">{plan.bandwidth}GB bandwidth</li>
                <li class="list-item">{plan.storage}GB storage</li>
                <li class="list-item">{formatNum(plan.executions)} executions</li>
                <li class="list-item">Email support</li>
            </ul>
        {/if}
    </div>
</Box>
