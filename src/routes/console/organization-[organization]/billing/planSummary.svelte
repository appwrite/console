<script lang="ts">
    import { base } from '$app/paths';
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { tierFree, tierPro, tierScale } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    // import { sdk } from '$lib/stores/sdk';
    import UsageRates from '$routes/console/wizard/usageRates.svelte';

    let showPricing = false;

    $: currentTier =
        $organization.billingPlan === 'tier-2'
            ? tierScale
            : $organization?.billingPlan === 'tier-1'
            ? tierPro
            : tierFree;
</script>

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
        <Box>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">
                    {currentTier.name}
                </h6>
            </svelte:fragment>

            <svelte:fragment slot="end">
                <p class="text">${currentTier.price}</p>
            </svelte:fragment>
        </Box>
        <div class="u-flex u-main-space-between u-cross-center">
            <p class="text">
                Billing period: {toLocaleDate($organization.billingCurrentInvoiceDate)} - {toLocaleDate(
                    $organization.billingNextInvoiceDate
                )}
            </p>
        </div>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <!-- TODO: add change plan method -->
        <Button text>Change plan</Button>
        <Button secondary href={`${base}/console/organization-${$organization.$id}/usage`}
            >View estimated usage</Button>
    </svelte:fragment>
</CardGrid>

<UsageRates bind:show={showPricing} tier={$organization?.billingPlan} />
