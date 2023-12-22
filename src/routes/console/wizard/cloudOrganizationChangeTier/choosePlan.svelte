<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { plansInfo, tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { updateStepStatus } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { changeOrganizationTier, changeTierSteps, isUpgrade } from './store';
    import { sdk } from '$lib/stores/sdk';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import type { Models } from '@appwrite.io/console';
    import { sizeToBytes } from '$lib/helpers/sizeConvertion';
    import { Pill } from '$lib/elements';
    import { BillingPlan } from '$lib/constants';

    let usage: OrganizationUsage = null;
    let members: Models.MembershipList = null;

    $: if ($changeOrganizationTier.billingPlan === BillingPlan.STARTER && $changeTierSteps) {
        $changeTierSteps = updateStepStatus($changeTierSteps, 2, true);
        $changeTierSteps = updateStepStatus($changeTierSteps, 3, true);
        $changeTierSteps = updateStepStatus($changeTierSteps, 4, true);
    }

    $: if (
        $changeOrganizationTier.billingPlan === BillingPlan.SCALE ||
        $changeOrganizationTier.billingPlan === BillingPlan.PRO
    ) {
        $changeTierSteps = updateStepStatus($changeTierSteps, 2, false);
        $changeTierSteps = updateStepStatus($changeTierSteps, 3, false);
        $changeTierSteps = updateStepStatus($changeTierSteps, 4, false);
    }

    $: if ($changeOrganizationTier.billingPlan) {
        $isUpgrade = $changeOrganizationTier.billingPlan > $organization.billingPlan;
        checkOverUsage();
    }

    function checkOverUsage() {
        if (!usage) return;
        const plan = $plansInfo.plans.find(
            (plan) => plan.$id === $changeOrganizationTier.billingPlan
        );

        const totBandwidth = usage?.bandwidth?.length > 0 ? usage.bandwidth[0].value : 0;
        const totUsers = usage?.users?.length > 0 ? usage.users[0].value : 0;
        $changeOrganizationTier.limitOverflow = {
            bandwidth: totBandwidth > plan.bandwidth ? totBandwidth - plan.bandwidth : 0,
            storage:
                usage.storageTotal > sizeToBytes(plan.storage, 'GB')
                    ? usage.storageTotal - plan.storage
                    : 0,
            users: totUsers > plan.users ? totUsers - plan.users : 0,
            executions:
                usage.executionsTotal > plan.executions
                    ? usage.executionsTotal - plan.executions
                    : 0,
            members: members.total > plan.members ? members.total - (plan.members || Infinity) : 0
        };
        if (
            ($changeOrganizationTier.limitOverflow.bandwidth > 0 ||
                $changeOrganizationTier.limitOverflow.storage > 0 ||
                $changeOrganizationTier.limitOverflow.users > 0 ||
                $changeOrganizationTier.limitOverflow.executions > 0 ||
                $changeOrganizationTier.limitOverflow.members > 0) &&
            $changeOrganizationTier.billingPlan === BillingPlan.STARTER
        ) {
            $changeOrganizationTier.isOverLimit = true;
            $changeTierSteps = updateStepStatus($changeTierSteps, 5, false);
        } else {
            $changeOrganizationTier.isOverLimit = false;
            $changeTierSteps = updateStepStatus($changeTierSteps, 5, true);
        }
    }

    onMount(async () => {
        usage = await sdk.forConsole.billing.listUsage($organization.$id);
        members = await sdk.forConsole.teams.listMemberships($organization.$id);

        //Select closest tier from starting one
        // if ($organization.billingPlan === BillingPlan.SCALE) {
        //     $changeOrganizationTier.billingPlan = BillingPlan.PRO;
        // }
        // else
        if ($organization.billingPlan === BillingPlan.PRO) {
            $changeOrganizationTier.billingPlan = BillingPlan.STARTER;
        } else if ($organization.billingPlan === BillingPlan.STARTER) {
            $changeOrganizationTier.billingPlan = BillingPlan.PRO;
        }
    });

    async function handleBefore() {
        if (!$changeOrganizationTier.billingPlan) {
            throw new Error('Please select a plan.');
        }
        if ($changeOrganizationTier.billingPlan === BillingPlan.STARTER) {
            $changeOrganizationTier.collaborators = [];
        }
    }

    $: freePlan = $plansInfo.plans.find((p) => p.$id === BillingPlan.STARTER);
    $: proPlan = $plansInfo.plans.find((p) => p.$id === BillingPlan.PRO);
    $: scalePlan = $plansInfo.plans.find((p) => p.$id === BillingPlan.SCALE);
</script>

<WizardStep beforeSubmit={handleBefore}>
    <svelte:fragment slot="title">Choose a plan</svelte:fragment>

    <p class="body-text-1 u-bold common-section">Plan</p>
    <p class="text u-margin-block-start-4">
        For more details on our plans, visit our <a
            class="link"
            href="http://appwrite.io/pricing"
            target="_blank"
            rel="noopener noreferrer">pricing page</a
        >.
    </p>
    <ul
        class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-8"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
        <li>
            <LabelCard
                name="plan"
                bind:group={$changeOrganizationTier.billingPlan}
                value="tier-0"
                disabled={$organization.billingPlan === BillingPlan.STARTER}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierFree.name} - ${freePlan.price}/month
                        </h4>
                        <p class="u-color-text-gray u-small">{tierFree.description}</p>
                    </div>
                    <div class:u-opacity-50={disabled}>
                        {#if $organization.billingPlan === BillingPlan.STARTER}
                            <Pill disabled>CURRENT PLAN</Pill>
                        {/if}
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="plan"
                bind:group={$changeOrganizationTier.billingPlan}
                value="tier-1"
                disabled={$organization.billingPlan === BillingPlan.PRO}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierPro.name} - ${proPlan.price}/month per organization member + extra
                            usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            {tierPro.description}
                        </p>
                    </div>
                    <div class:u-opacity-50={disabled}>
                        {#if $organization.billingPlan === BillingPlan.PRO}
                            <Pill disabled>CURRENT PLAN</Pill>
                        {:else}
                            <Pill>14 DAY FREE TRIAL</Pill>
                        {/if}
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="plan"
                bind:group={$changeOrganizationTier.billingPlan}
                value="tier-2"
                disabled>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierScale.name} - ${scalePlan.price}/month + extra usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            {tierScale.description}
                        </p>
                    </div>
                    <div class:u-opacity-50={disabled}>
                        <Pill disabled>COMING SOON</Pill>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
    </ul>
</WizardStep>
