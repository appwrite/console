<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo, type Tier, tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { LabelCard } from '..';

    export let billingPlan: Tier;
    export let anyOrgFree = false;
    export let isNewOrg = false;
    export let selfService = true;

    $: freePlan = $plansInfo.get(BillingPlan.FREE);
    $: proPlan = $plansInfo.get(BillingPlan.PRO);
    $: scalePlan = $plansInfo.get(BillingPlan.SCALE);
</script>

<Layout.Stack>
    <LabelCard
        name="plan"
        bind:group={billingPlan}
        disabled={anyOrgFree || !selfService}
        value={BillingPlan.FREE}
        tooltipShow={anyOrgFree}
        title={tierFree.name}
        tooltipText="You are limited to 1 Free organization per account.">
        <svelte:fragment slot="action">
            {#if $organization?.billingPlan === BillingPlan.FREE && !isNewOrg}
                <Badge variant="secondary" size="xs" content="Current plan" />
            {/if}
        </svelte:fragment>
        <Typography.Caption variant="400">
            {tierFree.description}
        </Typography.Caption>
        <Typography.Text>
            {formatCurrency(freePlan?.price ?? 0)}
        </Typography.Text>
    </LabelCard>
    <LabelCard
        name="plan"
        disabled={!selfService}
        bind:group={billingPlan}
        value={BillingPlan.PRO}
        title={tierPro.name}>
        <svelte:fragment slot="action">
            {#if $organization?.billingPlan === BillingPlan.PRO && !isNewOrg}
                <Badge variant="secondary" size="xs" content="Current plan" />
            {/if}
        </svelte:fragment>
        <Typography.Caption variant="400">
            {tierPro.description}
        </Typography.Caption>
        <Typography.Text>
            {formatCurrency(proPlan?.price ?? 0)} per month + usage
        </Typography.Text>
    </LabelCard>
    <LabelCard
        name="plan"
        bind:group={billingPlan}
        value={BillingPlan.SCALE}
        title={tierScale.name}>
        <svelte:fragment slot="action">
            {#if $organization?.billingPlan === BillingPlan.SCALE && !isNewOrg}
                <Badge variant="secondary" size="xs" content="Current plan" />
            {/if}
        </svelte:fragment>
        <Typography.Caption variant="400">
            {tierScale.description}
        </Typography.Caption>
        <Typography.Text>
            {formatCurrency(scalePlan?.price ?? 0)} per month + usage
        </Typography.Text>
    </LabelCard>
</Layout.Stack>
