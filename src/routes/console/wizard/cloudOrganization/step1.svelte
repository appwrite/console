<script lang="ts">
    import { CustomId, LabelCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { updateStepStatus } from '$lib/stores/wizard';
    import { createOrganization, createOrgSteps } from './store';

    let showCustomId = false;

    $: anyOrgFree = $organizationList.teams?.find(
        (org) => (org as Organization)?.billingPlan === 'tier-0'
    );

    $: if ($createOrganization.billingPlan === 'tier-0' && $createOrgSteps) {
        $createOrgSteps = updateStepStatus($createOrgSteps, 2, true);
        $createOrgSteps = updateStepStatus($createOrgSteps, 3, true);
    }

    $: if (
        $createOrganization.billingPlan === 'tier-2' ||
        $createOrganization.billingPlan === 'tier-1'
    ) {
        $createOrgSteps = updateStepStatus($createOrgSteps, 2, false);
        $createOrgSteps = updateStepStatus($createOrgSteps, 3, false);
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Organization details</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Organization name"
            bind:value={$createOrganization.name}
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Organization ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId
                bind:show={showCustomId}
                name="Organization"
                bind:id={$createOrganization.id} />
        {/if}
    </FormList>

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
                bind:group={$createOrganization.billingPlan}
                value="tier-0"
                disabled={!!anyOrgFree}
                tooltipText="You are limited to 1 Free organization per account."
                showTooltip={!!anyOrgFree}>
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
            <LabelCard name="plan" bind:group={$createOrganization.billingPlan} value="tier-1">
                <svelte:fragment slot="custom">
                    <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                        <h4 class="body-text-2 u-bold">
                            {tierPro.name} - ${tierPro.price}/month per organization member + exta
                            usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            {tierPro.description}
                        </p>
                    </div>
                    <Pill>14 DAY FREE TRIAL</Pill>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard name="plan" bind:group={$createOrganization.billingPlan} value="tier-2">
                <svelte:fragment slot="custom">
                    <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                        <h4 class="body-text-2 u-bold">
                            {tierScale.name} - ${tierScale.price}/month + extra usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            {tierScale.description}
                        </p>
                    </div>
                    <Pill>14 DAY FREE TRIAL</Pill>
                </svelte:fragment>
            </LabelCard>
        </li>
    </ul>
</WizardStep>
