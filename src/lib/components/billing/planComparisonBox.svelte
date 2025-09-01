<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatNum } from '$lib/helpers/string';
    import { plansInfo, tierFree, tierPro, tierScale, type Tier } from '$lib/stores/billing';
    import { Card, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';

    export let downgrade = false;

    let selectedTab: Tier = BillingPlan.FREE;

    $: plan = $plansInfo.get(selectedTab);
</script>

<Card.Base>
    <Layout.Stack>
        <Tabs.Root stretch let:root>
            <Tabs.Item.Button
                {root}
                active={selectedTab === BillingPlan.FREE}
                on:click={() => (selectedTab = BillingPlan.FREE)}>
                {tierFree.name}
            </Tabs.Item.Button>
            <Tabs.Item.Button
                {root}
                active={selectedTab === BillingPlan.PRO}
                on:click={() => (selectedTab = BillingPlan.PRO)}>
                {tierPro.name}
            </Tabs.Item.Button>
            <Tabs.Item.Button
                {root}
                active={selectedTab === BillingPlan.SCALE}
                on:click={() => (selectedTab = BillingPlan.SCALE)}>
                {tierScale.name}
            </Tabs.Item.Button>
        </Tabs.Root>

        <Typography.Text variant="m-600">{plan.name} plan</Typography.Text>
        {#if selectedTab === BillingPlan.FREE}
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
                <ul class="un-order-list">
                    <li>
                        Limited to {plan.databases} Database, {plan.buckets} Buckets, {plan.functions}
                        Functions per project
                    </li>
                    <li>Limited to 1 organization member</li>
                    <li>
                        Limited to {plan.bandwidth}GB bandwidth
                    </li>
                    <li>
                        Limited to {plan.storage}GB storage
                    </li>
                    <li>
                        Limited to {formatNum(plan.executions)} executions
                    </li>
                </ul>
            {/if}
        {:else if selectedTab === BillingPlan.PRO}
            <Typography.Text>Everything in the Free plan, plus:</Typography.Text>
            <ul class="un-order-list">
                <li>Unlimited databases, buckets, functions</li>
                <li>{plan.bandwidth}GB bandwidth</li>
                <li>{plan.storage}GB storage</li>
                <li>{formatNum(plan.executions)} executions</li>
                <li>Email support</li>
            </ul>
        {:else if selectedTab === BillingPlan.SCALE}
            <Typography.Text>Everything in the Pro plan, plus:</Typography.Text>
            <ul class="un-order-list">
                <li>Unlimited seats</li>
                <li>Organization roles</li>
                <li>SOC-2, HIPAA compliance</li>
                <li>SSO <span class="inline-tag">Coming soon</span></li>
                <li>Priority support</li>
            </ul>
        {/if}
    </Layout.Stack>
</Card.Base>
