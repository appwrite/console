<script lang="ts">
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { LabelCard } from '..';
    import type { Plan } from '$lib/sdk/billing';
    import { page } from '$app/state';
    import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';
    import { InputSelect } from '$lib/elements/forms';

    export let disabled = false;
    export let isNewOrg = false;
    export let selfService = true;
    export let anyOrgFree = false;
    export let billingPlan: BillingPlan;

    let selectedTiers: Record<string, string> = {};

    type PlanGroup = {
        key: string;
        plans: Plan[];
        isGrouped: boolean;
        tierOptions?: { value: string; label: string; badge?: string }[];
    };

    // filter, group, and sort plans
    $: groupedPlans = (() => {
        const plans = Object.values(page.data.plans.plans) as Plan[];
        const groups = new Map<string, Plan[]>();

        // Filter and group in one pass
        for (const plan of plans) {
            if (plan.$id === BillingPlan.SCALE) continue;

            const key = plan.group ?? plan.$id;
            const existing = groups.get(key);
            if (existing) {
                existing.push(plan);
            } else {
                groups.set(key, [plan]);
            }
        }

        // convert to array and process groups
        return Array.from(groups.entries())
            .map(([key, groupPlans]) => {
                const isGrouped = groupPlans.length > 1;
                const group: PlanGroup = { key, plans: groupPlans, isGrouped };

                // pre-compute tier options for grouped plans
                if (isGrouped) {
                    group.tierOptions = groupPlans.map((plan) => ({
                        value: plan.$id,
                        label: getTierLabel(plan),
                        badge: $organization?.billingPlan === plan.$id ? 'Current' : undefined
                    }));
                }

                return group;
            })
            .sort((a, b) => (a.plans[0]?.order ?? 0) - (b.plans[0]?.order ?? 0));
    })();

    $: currentPlanInList = Object.values(page.data.plans.plans).some(
        (plan: Plan) => plan.$id === $currentPlan?.$id
    );

    $: {
        for (const group of groupedPlans) {
            if (group.isGrouped) {
                // check if billingPlan is in this group
                const selectedGroupPlan = group.plans.find((p) => p.$id === billingPlan);
                if (selectedGroupPlan) {
                    selectedTiers[group.key] = selectedGroupPlan.$id;
                } else {
                    // If billingPlan not in group, check organization's current plan
                    const orgCurrentPlan = group.plans.find(
                        (p) => p.$id === $organization?.billingPlan
                    );
                    if (orgCurrentPlan) {
                        selectedTiers[group.key] = orgCurrentPlan.$id;
                    } else if (!selectedTiers[group.key]) {
                        // default to first plan in group
                        selectedTiers[group.key] = group.plans[0].$id;
                    }
                }
            }
        }
    }

    function handleTierChange(group: PlanGroup) {
        billingPlan = selectedTiers[group.key] as BillingPlan;
    }

    function message(plan: Plan): string {
        const price = formatCurrency(plan?.price ?? 0);
        if (resolvedProfile.id === ProfileMode.STUDIO) {
            if (plan.limits?.dailyCredits) {
                return `${plan.limits.dailyCredits.toLocaleString()} daily credits for ${price} per month`;
            } else if (plan.limits?.credits) {
                return `${plan.limits.credits.toLocaleString()} credits per month for ${price}`;
            }
        }
        return `${price} per month`;
    }

    function getTierLabel(plan: Plan): string {
        const price = formatCurrency(plan?.price ?? 0);
        if (resolvedProfile.id === ProfileMode.STUDIO) {
            if (plan.limits?.dailyCredits) {
                return `${plan.limits.dailyCredits.toLocaleString()} daily credits for ${price} per month`;
            } else if (plan.limits?.credits) {
                return `${plan.limits.credits.toLocaleString()} credits per month for ${price}`;
            }
        }
        return `${price} per month`;
    }
</script>

<Layout.Stack>
    {#each groupedPlans as group (group.key)}
        {@const basePlan = group.plans[0]}
        <LabelCard
            name="plan"
            bind:group={billingPlan}
            disabled={!selfService || (basePlan.$id === BillingPlan.FREE && anyOrgFree) || disabled}
            tooltipShow={basePlan.$id === BillingPlan.FREE && anyOrgFree}
            value={group.isGrouped ? selectedTiers[group.key] || basePlan.$id : basePlan.$id}
            title={basePlan.name}>
            <svelte:fragment slot="action">
                {#if group.plans.some((plan) => $organization?.billingPlan === plan.$id) && !isNewOrg}
                    <Badge variant="secondary" size="xs" content="Current plan" />
                {/if}
            </svelte:fragment>

            <Layout.Stack direction="column" gap="m">
                <Layout.Stack direction="column" gap="xxs">
                    <Typography.Caption variant="400">
                        {basePlan.desc}
                    </Typography.Caption>

                    {#if !group.isGrouped}
                        <Typography.Text>
                            {@const isZeroPrice = (basePlan.price ?? 0) <= 0}
                            {@const price = formatCurrency(basePlan.price ?? 0)}
                            {#if resolvedProfile.id === ProfileMode.STUDIO}
                                {message(basePlan)}
                            {:else}
                                {isZeroPrice ? price : message(basePlan)}
                            {/if}
                        </Typography.Text>
                    {/if}
                </Layout.Stack>

                {#if group.isGrouped}
                    <InputSelect
                        id="tier-{group.key}"
                        bind:value={selectedTiers[group.key]}
                        on:change={() => handleTierChange(group)}
                        options={group.tierOptions} />
                {/if}
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
