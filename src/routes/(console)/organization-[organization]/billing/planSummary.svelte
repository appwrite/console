<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Collapsible, CollapsibleItem, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { plansInfo, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BillingPlan } from '@appwrite.io/console';
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';

    let currentInvoice: Models.Invoice;
    let extraMembers = 0;
    let currentPlan: Models.BillingPlan;

    const today = new Date();
    onMount(async () => {
        const invoices = await sdk.forConsole.organizations.listInvoices($organization.$id, [
            Query.limit(1),
            Query.equal('from', $organization.billingCurrentInvoiceDate)
        ]);
        currentInvoice = invoices.invoices[0];
        const members = await sdk.forConsole.teams.listMemberships($organization.$id, []);
        extraMembers = members.total > 1 ? members.total - 1 : 0;

        currentPlan = await sdk.forConsole.organizations.getPlan($organization?.$id);
    });

    $: extraUsage = (currentInvoice?.amount ?? 0) - (currentPlan?.price ?? 0);
    $: extraAddons = currentInvoice?.usage?.length ?? 0;
    $: isTrial =
        new Date($organization?.billingStartDate).getTime() - today.getTime() > 0 &&
        $plansInfo.get($organization.billingPlan)?.trial;
</script>

{#if $organization}
    <CardGrid>
        <Heading tag="h2" size="6">Payment estimates</Heading>

        <p class="text">
            A breakdown of your estimated upcoming payment for the current billing period. Totals
            displayed exclude accumulated credits.
        </p>
        <svelte:fragment slot="aside">
            <p class="text u-bold">
                Billing period: {toLocaleDate($organization?.billingCurrentInvoiceDate)} - {toLocaleDate(
                    $organization?.billingNextInvoiceDate
                )}
            </p>
            <Collapsible>
                <CollapsibleItem noContent>
                    <span class="body-text-2">
                        {tierToPlan($organization?.billingPlan)?.name} plan</span>
                    <div class="body-text-2 u-margin-inline-start-auto">
                        {isTrial ? formatCurrency(0) : formatCurrency(currentPlan?.price)}
                    </div>
                </CollapsibleItem>
                {#if $organization?.billingPlan !== BillingPlan.Tier0 && extraUsage > 0}
                    <CollapsibleItem isInfo gap={8}>
                        <svelte:fragment slot="beforetitle">
                            <span class="body-text-2"><b>Add-ons</b></span><span class="inline-tag"
                                >{extraMembers ? extraAddons + 1 : extraAddons}</span>
                            <div class="icon">
                                <span class="icon-cheveron-down" aria-hidden="true"></span>
                            </div>
                        </svelte:fragment>
                        <svelte:fragment slot="end">
                            <div class="body-text-2 u-margin-inline-start-auto">
                                <b>
                                    {formatCurrency(extraUsage >= 0 ? extraUsage : 0)}
                                </b>
                            </div>
                        </svelte:fragment>

                        <ul>
                            {#if extraMembers}
                                <li class="u-flex-vertical u-gap-4 u-padding-block-8">
                                    <div class="u-flex u-gap-4">
                                        <h5 class="body-text-2 u-stretch">Additional members</h5>
                                        <div>
                                            {formatCurrency(
                                                extraMembers *
                                                    (currentPlan?.addons?.member?.price ?? 0)
                                            )}
                                        </div>
                                    </div>
                                    <div class="u-flex u-gap-4">
                                        <h5 class="body-text-2 u-stretch u-color-text-offline">
                                            {extraMembers}
                                        </h5>
                                    </div>
                                </li>
                            {/if}
                            {#if currentInvoice?.usage}
                                {#each currentInvoice.usage as excess, i}
                                    <li
                                        class="u-flex-vertical u-gap-4 {extraMembers
                                            ? 'u-padding-block-8'
                                            : 'u-padding-block-start-8'}"
                                        class:u-sep-block-start={i > 0 || extraMembers}>
                                        {#if ['storage', 'bandwidth'].includes(excess.name)}
                                            {@const excessValue = humanFileSize(excess.value)}
                                            <div class="u-flex u-main-space-between">
                                                <h5 class="body-text-2 u-stretch u-capitalize">
                                                    {excess.name}
                                                </h5>
                                                {formatCurrency(excess.amount)}
                                            </div>
                                            <h5
                                                class="body-text-2 u-stretch u-color-text-offline"
                                                title={formatNumberWithCommas(excess.value ?? 0) +
                                                    'bytes'}>
                                                {excessValue.value ?? 0}{excessValue.unit}
                                            </h5>
                                        {/if}
                                        {#if ['users', 'executions'].includes(excess.name)}
                                            <div class="u-flex u-main-space-between">
                                                <h5 class="body-text-2 u-stretch u-capitalize">
                                                    {excess.name}
                                                </h5>
                                                {formatCurrency(excess.amount)}
                                            </div>
                                            <h5
                                                class="body-text-2 u-stretch u-color-text-offline"
                                                title={formatNumberWithCommas(excess.value)}>
                                                {abbreviateNumber(excess.value)}
                                            </h5>
                                        {/if}
                                    </li>
                                {/each}
                            {/if}
                        </ul>
                    </CollapsibleItem>
                {/if}

                <CollapsibleItem noContent gap={4}>
                    <span class="body-text-2">Current total (USD)</span>
                    <span class="tooltip u-cross-center" aria-label="total info">
                        <span
                            class="icon-info"
                            aria-hidden="true"
                            use:tooltip={{
                                content:
                                    'Totals displayed are estimates updated every 24 hours and may not accurately reflect your invoice.'
                            }}></span>
                    </span>
                    <div class="body-text-2 u-margin-inline-start-auto">
                        {$organization?.billingPlan === BillingPlan.Tier0
                            ? formatCurrency(0)
                            : formatCurrency(currentInvoice?.amount ?? 0)}
                    </div>
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if $organization?.billingPlan === BillingPlan.Tier0}
                <div class="u-flex u-gap-16 u-flex-wrap">
                    <Button text href={`${base}/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                    <Button
                        disabled={$organization?.markedForDeletion}
                        href={$upgradeURL}
                        on:click={() =>
                            trackEvent('click_organization_upgrade', {
                                from: 'button',
                                source: 'billing_tab'
                            })}>
                        Upgrade
                    </Button>
                </div>
            {:else}
                <div class="u-flex u-gap-16 u-flex-wrap">
                    <Button
                        text
                        disabled={$organization?.markedForDeletion}
                        href={$upgradeURL}
                        on:click={() =>
                            trackEvent('click_organization_plan_update', {
                                from: 'button',
                                source: 'billing_tab'
                            })}>
                        Change plan
                    </Button>
                    <Button secondary href={`${base}/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                </div>
            {/if}
        </svelte:fragment>
    </CardGrid>
{/if}
