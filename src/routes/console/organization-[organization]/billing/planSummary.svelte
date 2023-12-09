<script lang="ts">
    import { base } from '$app/paths';
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import type { Invoice } from '$lib/sdk/billing';
    import { Query } from '@appwrite.io/console';

    let currentInvoice: Invoice;
    const today = new Date();
    onMount(async () => {
        const invoices = await sdk.forConsole.billing.listInvoices($organization.$id, [
            Query.limit(1),
            Query.orderDesc('$createdAt')
        ]);
        currentInvoice = invoices.invoices[0];
    });

    $: currentPlan = $plansInfo.plans.find((p) => p.$id === $organization?.billingPlan);
    $: extraUsage = currentInvoice?.amount - currentPlan?.price;

    $: isTrial = new Date($organization?.billingTrialEndDate).getTime() - today.getTime() > 0;
</script>

{#if $organization}
    <CardGrid>
        <Heading tag="h2" size="6">Overview</Heading>

        <p class="text">
            A summary of the current plan. For more information on Appwrite plans, <a
                type="button"
                class="link"
                href="https://appwrite.io/pricing"
                target="_blank"
                rel="noopener noreferrer">
                view our pricing guide.
            </a>
        </p>
        <svelte:fragment slot="aside">
            <Box class="u-flex-vertical u-gap-8">
                <div class="u-flex u-main-space-between u-cross-center">
                    <div class="u-flex u-gap-8 u-cross-center">
                        <h6 class="u-bold u-trim-1">
                            {tierToPlan($organization?.billingPlan)?.name} plan
                        </h6>
                        {#if $organization?.billingPlan !== 'tier-0' && isTrial}
                            <Pill>FREE TRIAL</Pill>
                        {/if}
                    </div>

                    <p class="text">
                        {#if !extraUsage}
                            <span class="text u-color-text-gray">Total to-date:</span>
                        {/if}
                        ${isTrial ? 0 : currentPlan?.price}
                    </p>
                </div>
                {#if currentInvoice && $organization?.billingPlan !== 'tier-0' && extraUsage > 0 && !isTrial}
                    <div class="u-flex u-main-space-between u-margin-block-start-8">
                        <p class="text u-color-text-gray">Extra usage</p>
                        <p class="text">${extraUsage}</p>
                    </div>
                    <div class="u-flex u-main-space-between">
                        <p class="text u-color-text-gray">Total to-date:</p>
                        <p class="text">${currentInvoice?.amount}</p>
                    </div>
                {/if}
            </Box>
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
                    <Button
                        disabled={$organization?.markedForDeletion}
                        on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                        Upgrade
                    </Button>
                </div>
            {:else}
                <div class="u-flex u-gap-16 u-flex-wrap">
                    <Button
                        text
                        disabled={$organization?.markedForDeletion}
                        on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
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
