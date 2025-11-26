<script lang="ts">
    import { page } from '$app/state';
    import { BillingPlan } from '$lib/constants';
    import type { Plan } from '$lib/sdk/billing';
    import { formatNum } from '$lib/helpers/string';
    import { isFreePlan, isProPlan } from '$lib/helpers/billing';
    import { plansInfo, type Tier, tierToPlan } from '$lib/stores/billing';
    import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';
    import { Card, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';

    let {
        downgrade = false
    }: {
        downgrade: boolean;
    } = $props();

    let selectedTab = $state(resolvedProfile.freeTier);

    const currentPlan = $derived($plansInfo.get(selectedTab));
    const visiblePlans = $derived.by(() => {
        return page.data.plans.plans.filter((plan: Plan) => plan.$id !== BillingPlan.SCALE);
    });

    function getCleanPlanName(plan: Plan) {
        return plan.name.replace(resolvedProfile.platform, '');
    }
</script>

<Card.Base>
    <Layout.Stack>
        <Tabs.Root stretch let:root>
            {#each visiblePlans as plan}
                <Tabs.Item.Button
                    {root}
                    active={selectedTab === plan.$id}
                    on:click={() => (selectedTab = plan.$id)}>
                    {getCleanPlanName(plan)}
                </Tabs.Item.Button>
            {/each}
        </Tabs.Root>

        <Typography.Text variant="m-600">{getCleanPlanName(currentPlan)} plan</Typography.Text>

        {#if resolvedProfile.platform === ProfileMode.CONSOLE}
            {@render appwritePlanView(currentPlan)}
        {:else}
            {@render imaginePlanView(currentPlan)}
        {/if}
    </Layout.Stack>
</Card.Base>

{#snippet appwritePlanView()}
    {#if isFreePlan(selectedTab)}
        {#if downgrade}
            <ul class="u-margin-block-start-8 list u-gap-4 u-small">
                <li class="list-item u-gap-4 u-cross-center">
                    <span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span>
                    <span class="text">
                        Limited to {currentPlan.databases} Database, {currentPlan.buckets} Buckets, {currentPlan.functions}
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
                    Limited to {currentPlan.databases} Database, {currentPlan.buckets} Buckets, {currentPlan.functions}
                    Functions per project
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
    {:else if isProPlan(selectedTab)}
        <Typography.Text>Everything in the Free plan, plus:</Typography.Text>
        <ul class="un-order-list">
            <li>Unlimited databases, buckets, functions</li>
            <li>Unlimited seats</li>
            <li>{currentPlan.bandwidth}GB bandwidth</li>
            <li>{currentPlan.storage}GB storage</li>
            <li>{formatNum(currentPlan.executions)} executions</li>
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
{/snippet}

{#snippet imaginePlanView()}
    <Typography.Text variant="m-600">
        {currentPlan?.chatMessages} daily messages
    </Typography.Text>
{/snippet}
