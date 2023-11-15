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

    let usage: OrganizationUsage = null;
    let members: Models.MembershipList = null;

    $: if ($changeOrganizationTier.billingPlan === 'tier-0' && $changeTierSteps) {
        $changeTierSteps = updateStepStatus($changeTierSteps, 2, true);
        $changeTierSteps = updateStepStatus($changeTierSteps, 3, true);
    }

    $: if (
        $changeOrganizationTier.billingPlan === 'tier-2' ||
        $changeOrganizationTier.billingPlan === 'tier-1'
    ) {
        $changeTierSteps = updateStepStatus($changeTierSteps, 2, false);
        $changeTierSteps = updateStepStatus($changeTierSteps, 3, false);
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

        $changeOrganizationTier.limitOverflow = {
            bandwidth:
                usage.bandwidth[0] > plan.bandwidth ? usage.bandwidth[0] - plan.bandwidth : 0,
            storage:
                usage.storage[0] > sizeToBytes(plan.storage, 'GB')
                    ? usage.storage[0] - plan.storage
                    : 0,
            users: usage.users[0] > plan.users ? usage.users[0] - plan.users : 0,
            executions:
                usage.executions[0] > plan.executions ? usage.executions[0] - plan.executions : 0,
            members: members.total > plan.members ? members.total - (plan.members || Infinity) : 0
        };
        if (
            $changeOrganizationTier.limitOverflow.bandwidth > 0 ||
            $changeOrganizationTier.limitOverflow.storage > 0 ||
            $changeOrganizationTier.limitOverflow.users > 0 ||
            $changeOrganizationTier.limitOverflow.executions > 0 ||
            $changeOrganizationTier.limitOverflow.members > 0
        ) {
            $changeOrganizationTier.isOverLimit = true;
            $changeTierSteps = updateStepStatus($changeTierSteps, 4, false);
        } else {
            $changeOrganizationTier.isOverLimit = false;
            $changeTierSteps = updateStepStatus($changeTierSteps, 4, true);
        }

        console.log($changeOrganizationTier.limitOverflow);
    }

    onMount(async () => {
        usage = await sdk.forConsole.billing.listUsage($organization.$id);
        members = await sdk.forConsole.teams.listMemberships($organization.$id);

        //Select closest tier from starting one
        if ($organization.billingPlan === 'tier-2') {
            $changeOrganizationTier.billingPlan = 'tier-1';
        } else if ($organization.billingPlan === 'tier-1') {
            $changeOrganizationTier.billingPlan = 'tier-2';
        } else if ($organization.billingPlan === 'tier-0') {
            $changeOrganizationTier.billingPlan = 'tier-1';
        }
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Choose a plan</svelte:fragment>

    <p class="body-text-1 u-bold common-section">Plan</p>
    <p class="text">
        For more details on our plans, visit our <a
            class="link"
            href="http://appwrite.io/pricing"
            target="_blank"
            rel="noopener noreferrer">pricing page</a
        >.
    </p>
    <ul
        class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-16"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
        <li>
            <LabelCard
                name="plan"
                bind:group={$changeOrganizationTier.billingPlan}
                value="tier-0"
                disabled={$organization.billingPlan === 'tier-0'}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierFree.name} - ${tierFree.price}/month
                        </h4>
                        <p class="u-color-text-gray u-small">{tierFree.description}</p>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="plan"
                bind:group={$changeOrganizationTier.billingPlan}
                value="tier-1"
                disabled={$organization.billingPlan === 'tier-1'}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierPro.name} - ${tierPro.price}/month per organization member + extra
                            usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            {tierPro.description}
                        </p>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="plan"
                bind:group={$changeOrganizationTier.billingPlan}
                value="tier-2"
                disabled={$organization.billingPlan === 'tier-2'}>
                <svelte:fragment slot="custom" let:disabled>
                    <div
                        class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                        class:u-opacity-50={disabled}>
                        <h4 class="body-text-2 u-bold">
                            {tierScale.name} - ${tierScale.price}/month + extra usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            {tierScale.description}
                        </p>
                    </div>
                </svelte:fragment>
            </LabelCard>
        </li>
    </ul>
</WizardStep>
