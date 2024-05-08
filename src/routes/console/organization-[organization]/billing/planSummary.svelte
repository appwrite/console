<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Collapsible, CollapsibleItem, Heading } from '$lib/components';
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
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BillingPlan } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';

    let currentInvoice: Invoice;
    let extraMembers = 0;
    const today = new Date();
    onMount(async () => {
        const invoices = await sdk.forConsole.billing.listInvoices($organization.$id, [
            Query.limit(1),
            Query.orderDesc('$createdAt')
        ]);
        currentInvoice = invoices.invoices[0];
        const members = await sdk.forConsole.teams.listMemberships($organization.$id, []);
        extraMembers = members.total > 1 ? members.total - 1 : 0;
    });

    $: currentPlan = $plansInfo?.get($organization?.billingPlan);
    $: extraUsage = currentInvoice?.amount - currentPlan?.price || 0;
    $: isTrial =
        new Date($organization?.billingStartDate).getTime() - today.getTime() > 0 &&
        $plansInfo.get($organization.billingPlan)?.trialDays;
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
                <CollapsibleItem noContent isInfo>
                    <span class="body-text-2">
                        {tierToPlan($organization?.billingPlan)?.name} plan</span>
                    <div class="body-text-2 u-margin-inline-start-auto">
                        {isTrial ? formatCurrency(0) : formatCurrency(currentPlan?.price)}
                    </div>
                </CollapsibleItem>
                {#if $organization?.billingPlan !== BillingPlan.STARTER}
                    <CollapsibleItem isInfo>
                        <svelte:fragment slot="beforetitle">
                            <span class="body-text-2">Add-ons</span><span class="inline-tag"
                                >{extraMembers
                                    ? currentInvoice?.usage?.length + 1
                                    : currentInvoice?.usage?.length}</span>
                            <div class="icon">
                                <span class="icon-cheveron-down" aria-hidden="true"></span>
                            </div>
                        </svelte:fragment>
                        <svelte:fragment slot="end">
                            <div class="body-text-2 u-margin-inline-start-auto">
                                {formatCurrency(extraUsage)}
                            </div>
                        </svelte:fragment>
                        {#if extraUsage && !isTrial}
                            <ul>
                                {#if extraMembers}
                                    <li class="u-flex-vertical u-gap-4 u-padding-block-8">
                                        <div class="u-flex u-gap-4">
                                            <h5 class="body-text-2 u-stretch">
                                                Additional members
                                            </h5>
                                            <div>
                                                {formatCurrency(extraMembers * 15)}
                                            </div>
                                        </div>
                                        <div class="u-flex u-gap-4">
                                            <h5 class="body-text-2 u-stretch u-color-text-offline">
                                                {extraMembers}
                                            </h5>
                                        </div>
                                    </li>
                                {/if}
                            </ul>
                        {/if}
                        {#if currentInvoice?.usage}
                            {#each currentInvoice.usage as excess}
                                <li class="u-flex-vertical u-gap-4 u-padding-block-8">
                                    {#if ['storage', 'bandwidth'].includes(excess.name)}
                                        {@const excessValue = humanFileSize(excess.value)}
                                        <div class="u-flex u-gap-4">
                                            <h5 class="body-text-2 u-stretch">{excess.name}</h5>
                                            <div>
                                                {formatCurrency(excess.amount)}
                                            </div>
                                        </div>
                                        <div class="u-flex u-gap-4">
                                            <h5
                                                class="body-text-2 u-stretch u-color-text-offline"
                                                title={formatNumberWithCommas(excess.value ?? 0) +
                                                    'bytes'}>
                                                {excessValue.value ?? 0}{excessValue.unit}
                                            </h5>
                                        </div>
                                    {/if}
                                    {#if ['users', 'executions'].includes(excess.name)}
                                        <li class="u-flex-vertical u-gap-4 u-padding-block-8">
                                            <div class="u-flex u-gap-4">
                                                <h5 class="body-text-2 u-stretch">{excess.name}</h5>
                                                <div>
                                                    {formatCurrency(excess.amount)}
                                                </div>
                                            </div>
                                            <div class="u-flex u-gap-4">
                                                <h5
                                                    class="body-text-2 u-stretch u-color-text-offline"
                                                    title={formatNumberWithCommas(excess.value)}>
                                                    {abbreviateNumber(excess.value)}
                                                </h5>
                                            </div>
                                        </li>
                                    {/if}
                                </li>
                            {/each}
                        {/if}
                    </CollapsibleItem>
                {/if}

                <CollapsibleItem noContent isInfo gap={4}>
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
                        {formatCurrency(currentInvoice?.amount ?? 0)}
                    </div>
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if $organization?.billingPlan === BillingPlan.STARTER}
                <div class="u-flex u-gap-16 u-flex-wrap">
                    <Button text href={`${base}/console/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                    <Button
                        disabled={$organization?.markedForDeletion}
                        on:click={() => wizard.start(ChangeOrganizationTierCloud)}
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
                        on:click={() => wizard.start(ChangeOrganizationTierCloud)}
                        on:click={() =>
                            trackEvent('click_organization_plan_update', {
                                from: 'button',
                                source: 'billing_tab'
                            })}>
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
