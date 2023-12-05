<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { daysLeftInTrial, tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { aggregationList } from './store';

    $: currentTier =
        $organization?.billingPlan === 'tier-2'
            ? tierScale
            : $organization?.billingPlan === 'tier-1'
              ? tierPro
              : tierFree;

    $: aggregation = $aggregationList.aggregations[0];
</script>

{#if $organization}
    <CardGrid>
        <Heading tag="h2" size="6">Plan summary</Heading>

        <p class="text">
            Your current project plan. For more information on Appwrite plans, <a
                type="button"
                class="link"
                href="https://appwrite.io/pricing"
                target="_blank"
                rel="noopener noreferrer">
                view our pricing guide.
            </a>
        </p>
        <svelte:fragment slot="aside">
            <div class="box u-flex u-main-space-between u-cross-center">
                <div class="u-flex u-gap-8 u-cross-center">
                    <h6 class="u-bold u-trim-1">
                        {currentTier.name} plan
                    </h6>
                    {#if $organization?.billingPlan !== 'tier-0' && $daysLeftInTrial}
                        <Pill>FREE TRIAL</Pill>
                    {/if}
                </div>

                <p class="text">
                    {#if $organization?.billingPlan !== 'tier-0'}
                        <span class="u-color-text-gray"> Total to date (in USD): </span>
                    {/if}
                    ${aggregation?.amount}
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
            {#if $organization?.billingPlan === 'tier-0'}
                <div class="u-flex u-gap-16 u-flex-wrap">
                    <Button text href={`${base}/console/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                    <Button on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                        Upgrade
                    </Button>
                </div>
            {:else}
                <div class="u-flex u-gap-16 u-flex-wrap">
                    <Button text on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                        Change plan
                    </Button>
                    <Button
                        secondary
                        href={`${base}/console/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                </div>
            {/if}
        </svelte:fragment>
    </CardGrid>
{/if}
