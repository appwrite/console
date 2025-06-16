<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { type Tier } from '$lib/stores/billing';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { LabelCard } from '..';
    import type { Plan } from '$lib/sdk/billing';
    import { page } from '$app/state';

    export let billingPlan: Tier;
    export let anyOrgFree = false;
    export let isNewOrg = false;
    export let selfService = true;

    $: plans = Object.values(page.data.plans.plans) as Plan[];
    $: currentPlanInList = plans.filter((plan) => plan.$id === $currentPlan?.$id).length > 0;
</script>

<Layout.Stack>
    {#each plans as plan}
        <LabelCard
            name="plan"
            bind:group={billingPlan}
            disabled={!selfService || (plan.$id === BillingPlan.FREE && anyOrgFree)}
            tooltipShow={plan.$id === BillingPlan.FREE && anyOrgFree}
            value={plan.$id}
            title={plan.name}>
            <svelte:fragment slot="action">
                {#if $organization?.billingPlan === plan.$id && !isNewOrg}
                    <Badge variant="secondary" size="xs" content="Current plan" />
                {/if}
            </svelte:fragment>
            <Typography.Caption variant="400">
                {plan.desc}
            </Typography.Caption>
            <Typography.Text>
                {@const isZeroPrice = (plan.price ?? 0) <= 0}
                {@const price = formatCurrency(plan.price ?? 0)}
                {isZeroPrice ? price : `${price} per month + usage`}
            </Typography.Text>
        </LabelCard>
    {/each}
    {#if $currentPlan && !currentPlanInList}
        <LabelCard
            name="plan"
            bind:group={billingPlan}
            value={$currentPlan.$id}
            title={$currentPlan.name}>
            <svelte:fragment slot="action">
                {#if $organization?.billingPlan === $currentPlan.$id && !isNewOrg}
                    <Badge variant="secondary" size="xs" content="Current plan" />
                {/if}
            </svelte:fragment>
            <Typography.Caption variant="400">
                {$currentPlan.desc}
            </Typography.Caption>
            <Typography.Text>
                {@const isZeroPrice = ($currentPlan?.price ?? 0) <= 0}
                {@const price = formatCurrency($currentPlan?.price ?? 0)}
                {isZeroPrice ? price : `${price} per month + usage`}
            </Typography.Text>
        </LabelCard>
    {/if}
</Layout.Stack>
