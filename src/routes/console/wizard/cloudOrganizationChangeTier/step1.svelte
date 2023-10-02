<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { updateStepStatus } from '$lib/stores/wizard';
    import { changeOrganizationTier, changeTierSteps } from './store';

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
</script>

<WizardStep>
    <svelte:fragment slot="title">Choose a plan</svelte:fragment>

    <p class="body-text-1 u-bold common-section">Plan</p>
    <p class="text">
        For more details on our plans, visit our <a
            class="link"
            href="http://#"
            target="_blank"
            rel="noopener noreferrer">pricing page</a
        >.
    </p>
    <ul
        class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-16"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
        {#if $organization.billingPlan !== 'tier-0'}
            <li>
                <LabelCard
                    name="plan"
                    bind:group={$changeOrganizationTier.billingPlan}
                    value="tier-0">
                    <svelte:fragment slot="custom">
                        <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                            <h4 class="body-text-2 u-bold">
                                {tierFree.name} - ${tierFree.price}/month
                            </h4>
                            <p class="u-color-text-gray u-small">{tierFree.description}</p>
                        </div>
                    </svelte:fragment>
                </LabelCard>
            </li>
        {/if}
        {#if $organization.billingPlan !== 'tier-1'}
            <li>
                <LabelCard
                    name="plan"
                    bind:group={$changeOrganizationTier.billingPlan}
                    value="tier-1">
                    <svelte:fragment slot="custom">
                        <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                            <h4 class="body-text-2 u-bold">
                                {tierPro.name} - ${tierPro.price}/month per organization member +
                                exta usage
                            </h4>
                            <p class="u-color-text-gray u-small">
                                {tierPro.description}
                            </p>
                        </div>
                        <Pill>14 DAY FREE TRIAL</Pill>
                    </svelte:fragment>
                </LabelCard>
            </li>
        {/if}
        {#if $organization.billingPlan !== 'tier-2'}
            <li>
                <LabelCard
                    name="plan"
                    bind:group={$changeOrganizationTier.billingPlan}
                    value="tier-2">
                    <svelte:fragment slot="custom">
                        <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                            <h4 class="body-text-2 u-bold">
                                {tierScale.name} - ${tierScale.price}/month + exta usage
                            </h4>
                            <p class="u-color-text-gray u-small">
                                {tierScale.description}
                            </p>
                        </div>
                        <Pill>14 DAY FREE TRIAL</Pill>
                    </svelte:fragment>
                </LabelCard>
            </li>
        {/if}
    </ul>

    <!-- {#if $organization.billingPlan === 'tier-0'}TODO: add transfer modal{/if} -->
</WizardStep>
