<script lang="ts">
    import { page } from '$app/state';
    import { formatNum } from '$lib/helpers/string';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';
    import { Card, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';
    import { getBasePlanFromGroup, planHasGroup, plansInfo } from '$lib/stores/billing';

    let {
        downgrade = false
    }: {
        downgrade?: boolean;
    } = $props();

    let selectedTab: string = $state(getBasePlanFromGroup(BillingPlanGroup.Starter).$id);

    const currentPlan: Models.BillingPlan = $derived($plansInfo.get(selectedTab));
    const visiblePlans: Array<Models.BillingPlan> = $derived.by(() => {
        return page.data.plans.plans.filter(
            (plan: Models.BillingPlan) => plan.group !== BillingPlanGroup.Scale
        );
    });

    const uniquePlans: Array<Models.BillingPlan> = $derived.by(() => {
        const map = new Map(visiblePlans.map((p) => [p.group ?? p.$id, p]));

        return [...map.values()];
    });

    function pluralize(count: number, singular: string, plural?: string) {
        if (count === 1) return singular;
        return plural ?? `${singular}s`;
    }
</script>

<Card.Base>
    <Layout.Stack>
        <Tabs.Root stretch let:root>
            {#each uniquePlans as plan}
                <Tabs.Item.Button
                    {root}
                    active={selectedTab === plan.$id}
                    on:click={() => (selectedTab = plan.$id)}>
                    {plan.name}
                </Tabs.Item.Button>
            {/each}
        </Tabs.Root>

        <Typography.Text variant="m-600">{currentPlan.name} plan</Typography.Text>

        {@render appwritePlanView()}
    </Layout.Stack>
</Card.Base>

{#snippet appwritePlanView()}
    {#if planHasGroup(selectedTab, BillingPlanGroup.Starter)}
        {#if downgrade}
            <ul class="u-margin-block-start-8 list u-gap-4 u-small">
                <li class="list-item u-gap-4 u-cross-center">
                    <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                    <span class="text">
                        Limited to {currentPlan.databases}
                        {pluralize(currentPlan.databases, 'Database')}, {currentPlan.buckets}
                        {pluralize(currentPlan.buckets, 'Bucket')}, {currentPlan.functions}
                        {pluralize(currentPlan.functions, 'Function')} per project
                    </span>
                </li>
                <li class="list-item u-gap-4 u-cross-center">
                    <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                    <span class="text"> Limited to 1 organization member </span>
                </li>
                <li class="list-item u-gap-4 u-cross-center">
                    <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                    <span class="text">
                        {currentPlan.bandwidth}GB bandwidth
                    </span>
                </li>
                <li class="list-item u-gap-4 u-cross-center">
                    <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                    <span class="text">
                        {currentPlan.storage}GB storage
                    </span>
                </li>
                <li class="list-item u-gap-4 u-cross-center">
                    <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                    <span class="text">
                        {formatNum(currentPlan.executions)} executions
                    </span>
                </li>
            </ul>
        {:else}
            <ul class="un-order-list">
                <li>
                    Limited to {currentPlan.databases}
                    {pluralize(currentPlan.databases, 'Database')}, {currentPlan.buckets}
                    {pluralize(currentPlan.buckets, 'Bucket')}, {currentPlan.functions}
                    {pluralize(currentPlan.functions, 'Function')} per project
                </li>
                <li>Limited to 1 organization member</li>
                <li>
                    Limited to {currentPlan.bandwidth}GB bandwidth
                </li>
                <li>
                    Limited to {currentPlan.storage}GB storage
                </li>
                <li>
                    Limited to {formatNum(currentPlan.executions)} executions
                </li>
            </ul>
        {/if}
    {:else if planHasGroup(selectedTab, BillingPlanGroup.Pro)}
        <Typography.Text>Everything in the Free plan, plus:</Typography.Text>
        <ul class="un-order-list">
            <li>Unlimited databases, buckets, functions</li>
            <li>Unlimited seats</li>
            <li>{currentPlan.bandwidth}GB bandwidth</li>
            <li>{currentPlan.storage}GB storage</li>
            <li>{formatNum(currentPlan.executions)} executions</li>
            <li>Email support</li>
        </ul>
    {:else if planHasGroup(selectedTab, BillingPlanGroup.Scale)}
        <Typography.Text>Everything in the Pro plan, plus:</Typography.Text>
        <ul class="un-order-list">
            <li>Unlimited seats</li>
            <li>Organization roles</li>
            <li>SOC-2, HIPAA compliance</li>
            <li>SSO <span class="inline-tag">Coming soon</span></li>
            <li>Priority support</li>
        </ul>
    {/if}
{/snippet}
