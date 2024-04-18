<script lang="ts">
    import { base } from '$app/paths';
    import { Box, CardGrid, EyebrowHeading, Heading } from '$lib/components';
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
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BillingPlan } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { Table, TableCell, TableCellText, TableRow, TableRowButton } from '$lib/elements/table';

    let currentInvoice: Invoice;
    const today = new Date();
    onMount(async () => {
        const invoices = await sdk.forConsole.billing.listInvoices($organization.$id, [
            Query.limit(1),
            Query.orderDesc('$createdAt')
        ]);
        currentInvoice = invoices.invoices[0];
    });

    $: currentPlan = $plansInfo?.get($organization?.billingPlan);
    $: extraUsage = currentInvoice?.amount - currentPlan?.price;
    $: isTrial = new Date($organization?.billingStartDate).getTime() - today.getTime() > 0;
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
            <Table noMargin noStyles>
                <TableRow>
                    <TableCell>{tierToPlan($organization?.billingPlan)?.name} plan</TableCell>
                    <TableCell style="text-align: right;">
                        {isTrial
                            ? formatCurrency(0)
                            : formatCurrency(currentPlan?.price)}</TableCell>
                </TableRow>
                <TableRowButton>
                    <TableCell>Add-ons <span class="inline-tag">number</span></TableCell>
                    <TableCell style="text-align: right;">
                        {formatCurrency(currentInvoice?.amount ?? 0)}
                    </TableCell>
                </TableRowButton>
                <TableRow>
                    <TableCell>Current total (USD)</TableCell>
                    <TableCellText style="text-align: right;">
                        {formatCurrency(currentInvoice?.amount ?? 0)}
                    </TableCellText>
                </TableRow>
            </Table>
            <Box class="u-flex-vertical u-gap-8">
                <div class="u-flex u-main-space-between u-cross-center">
                    <div class="u-flex u-gap-8 u-cross-center">
                        <h6 class="body-text-1 u-bold u-trim-1">
                            {tierToPlan($organization?.billingPlan)?.name} plan
                        </h6>
                        {#if $organization?.billingPlan !== BillingPlan.STARTER && isTrial}
                            <Pill>TRIAL</Pill>
                        {/if}
                    </div>

                    <p class="text">
                        {#if !extraUsage}
                            <span class="text u-color-text-gray">Total to-date:</span>
                        {/if}
                        <span class="body-text-1">
                            {isTrial ? formatCurrency(0) : formatCurrency(currentPlan?.price)}
                        </span>
                    </p>
                </div>
                {#if currentInvoice?.usage?.length && $organization?.billingPlan !== BillingPlan.STARTER && !isTrial}
                    {@const extraMembers = currentInvoice.usage.find((u) => u.name === 'members')}
                    {#if extraMembers}
                        <div class="u-margin-block-start-24">
                            <EyebrowHeading tag="h6" size={3}>Additional members</EyebrowHeading>
                            <ul>
                                <li class="u-flex u-main-space-between u-margin-block-start-8">
                                    <p class="text u-color-text-gray">
                                        <span> {extraMembers.value}</span>
                                        {extraMembers.name}
                                    </p>
                                    <p class="text">{formatCurrency(extraMembers.amount)}</p>
                                </li>
                            </ul>
                        </div>
                    {/if}
                    <div class="u-margin-block-start-24">
                        <EyebrowHeading tag="h6" size={3}>Addons</EyebrowHeading>
                        <ul>
                            {#each currentInvoice.usage as excess}
                                {#if ['storage', 'bandwidth'].includes(excess.name)}
                                    {@const excessValue = humanFileSize(excess.value)}
                                    <li class="u-flex u-main-space-between u-margin-block-start-8">
                                        <p class="text u-color-text-gray">
                                            <span
                                                title={formatNumberWithCommas(excess.value) +
                                                    'bytes'}>
                                                {excessValue.value}{excessValue.unit}
                                            </span>
                                            {excess.name}
                                        </p>
                                        <p class="text">{formatCurrency(excess.amount)}</p>
                                    </li>
                                {/if}
                                {#if ['users', 'executions'].includes(excess.name)}
                                    <li class="u-flex u-main-space-between u-margin-block-start-8">
                                        <p class="text u-color-text-gray">
                                            <span title={formatNumberWithCommas(excess.value)}
                                                >{abbreviateNumber(excess.value)}</span>
                                            {excess.name}
                                        </p>
                                        <p class="text">{formatCurrency(excess.amount)}</p>
                                    </li>
                                {/if}
                            {/each}
                            <li class="u-flex u-main-space-between u-margin-block-start-16">
                                <p class="body-text-1 u-bold">Total to-date:</p>
                                <p class="body-text-1 u-bold">
                                    {formatCurrency(currentInvoice?.amount ?? 0)}
                                </p>
                            </li>
                        </ul>
                    </div>
                {/if}
            </Box>
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
