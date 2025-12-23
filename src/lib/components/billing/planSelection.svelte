<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { Badge, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { LabelCard } from '..';
    import type { Plan } from '$lib/sdk/billing';
    import { page } from '$app/state';

    export let billingPlan: BillingPlan;
    export let isNewOrg = false;
    export let selfService = true;
    export let anyOrgFree = false;

    $: plans = Object.values(page.data.plans.plans) as Plan[];
    $: currentPlanInList = plans.some((plan) => plan.$id === $currentPlan?.$id);

    // experiment to remove scale plan temporarily
    $: plansWithoutScale = plans.filter((plan) => plan.$id != BillingPlan.SCALE);

    function shouldShowTooltip(plan: Plan) {
        if (plan.$id !== BillingPlan.FREE) return true;
        else return !anyOrgFree;
    }
</script>

<Layout.Stack>
    {#each plansWithoutScale as plan}
        <Tooltip disabled={shouldShowTooltip(plan)} maxWidth="fit-content">
            <LabelCard
                name="plan"
                bind:group={billingPlan}
                disabled={!selfService || (plan.$id === BillingPlan.FREE && anyOrgFree)}
                tooltipShow={plan.$id === BillingPlan.FREE && anyOrgFree}
                value={plan.$id}
                title={plan.name}>
                <svelte:fragment slot="action">
                    {#if $organization?.billingPlanId === plan.$id && !isNewOrg}
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

            <svelte:fragment slot="tooltip">
                Only 1 free organization is allowed per account.
            </svelte:fragment>
        </Tooltip>
    {/each}
    {#if $currentPlan && !currentPlanInList}
        <LabelCard
            name="plan"
            bind:group={billingPlan}
            value={$currentPlan.$id}
            title={$currentPlan.name}>
            <svelte:fragment slot="action">
                {#if $organization?.billingPlanId === $currentPlan.$id && !isNewOrg}
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
