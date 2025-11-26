<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { LabelCard } from '..';
    import type { Plan } from '$lib/sdk/billing';
    import { page } from '$app/state';
    import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';

    export let isNewOrg = false;
    export let selfService = true;
    export let anyOrgFree = false;
    export let billingPlan: BillingPlan;

    $: plans = Object.values(page.data.plans.plans) as Plan[];
    $: currentPlanInList = plans.some((plan) => plan.$id === $currentPlan?.$id);

    // experiment to remove scale plan temporarily
    $: plansWithoutScale = plans.filter((plan) => plan.$id != BillingPlan.SCALE);

    function message(plan: Plan): string {
        const price = formatCurrency(plan?.price ?? 0);
        if (resolvedProfile.id === ProfileMode.STUDIO) {
            return `${plan.chatMessages} daily messages for ${price} per month + usage`;
        } else {
            return `${price} per month + usage`;
        }
    }
</script>

<Layout.Stack>
    {#each plansWithoutScale as plan}
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

            <Layout.Stack direction="column" gap="xxs">
                <Typography.Caption variant="400">
                    {plan.desc}
                </Typography.Caption>

                <Typography.Text>
                    {@const isZeroPrice = (plan.price ?? 0) <= 0}
                    {@const price = formatCurrency(plan.price ?? 0)}
                    {isZeroPrice ? price : message(plan)}
                </Typography.Text>
            </Layout.Stack>
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
                {isZeroPrice ? price : message($currentPlan)}
            </Typography.Text>
        </LabelCard>
    {/if}
</Layout.Stack>
