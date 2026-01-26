<script lang="ts">
    import { LabelCard } from '..';
    import { page } from '$app/state';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';
    import { Badge, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { billingIdToPlan } from '$lib/stores/billing';

    let {
        isNewOrg = false,
        selfService = true,
        anyOrgFree = false,
        selectedBillingPlan = $bindable()
    }: {
        isNewOrg?: boolean;
        selfService?: boolean;
        anyOrgFree?: boolean;
        selectedBillingPlan: Models.BillingPlan;
    } = $props();

    let selectedPlan = $state(selectedBillingPlan.$id);

    const visiblePlans = $derived(Object.values(page.data.plans.plans) as Models.BillingPlan[]);
    const currentPlanInList = $derived(visiblePlans.some((plan) => plan.$id === $currentPlan?.$id));

    function shouldShowTooltip(plan: Models.BillingPlan) {
        if (plan.group !== BillingPlanGroup.Starter) return true;
        else return !anyOrgFree;
    }

    function shouldDisable(plan: Models.BillingPlan) {
        return plan.group === BillingPlanGroup.Starter && anyOrgFree;
    }

    $effect(() => {
        selectedBillingPlan = billingIdToPlan(selectedPlan);
    });
</script>

<Layout.Stack>
    {#each visiblePlans as plan}
        <Tooltip disabled={shouldShowTooltip(plan)} maxWidth="fit-content">
            <LabelCard
                name="plan"
                bind:group={selectedPlan}
                disabled={!selfService || shouldDisable(plan)}
                tooltipShow={shouldDisable(plan)}
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
            bind:group={selectedPlan}
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
