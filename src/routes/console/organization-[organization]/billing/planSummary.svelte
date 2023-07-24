<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    // import { sdk } from '$lib/stores/sdk';
    import UsageRates from '$routes/console/wizard/cloudOrganization/usageRates.svelte';

    let showPricing = false;

    $: currentTier =
        $organization?.billingPlan === 'tier-2'
            ? tierScale
            : $organization?.billingPlan === 'tier-1'
            ? tierPro
            : tierFree;
</script>

{#if $organization}
    <CardGrid>
        <Heading tag="h2" size="6">Plan summary</Heading>

        <p class="text">
            Your current project plan. For more information on Appwrite plans, <button
                type="button"
                class="link"
                on:click|preventDefault={() => (showPricing = true)}>
                view our pricing guide.
            </button>
        </p>
        <svelte:fragment slot="aside">
            <div class="box u-flex u-main-space-between u-cross-center">
                <div class="u-flex u-gap-8 u-cross-center">
                    <h6 class="u-bold u-trim-1">
                        {currentTier.name}
                    </h6>
                    {#if $organization.billingPlan !== 'tier-0' && $organization.billingTrialDays}
                        <Pill>FREE TRIAL</Pill>
                    {/if}
                </div>

                <p class="text">
                    {#if $organization.billingPlan !== 'tier-0' && $organization.billingTrialDays}
                        <span class="u-color-text-gray"> Esimated total: </span>
                    {/if}
                    ${currentTier.price}
                </p>
            </div>
            <div class="u-flex u-main-space-between u-cross-center">
                <p class="text">
                    Billing period: {toLocaleDate($organization?.billingCurrentInvoiceDate)} - {toLocaleDate(
                        $organization?.billingNextInvoiceDate
                    )}
                </p>
            </div>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <!-- TODO: add change plan method -->
            <Button text on:click={() => wizard.start(ChangeOrganizationTierCloud)}
                >Change plan</Button>
            <Button secondary href={`${base}/console/organization-${$organization?.$id}/usage`}
                >View estimated usage</Button>
        </svelte:fragment>
    </CardGrid>
{/if}

<UsageRates bind:show={showPricing} tier={$organization?.billingPlan} />
