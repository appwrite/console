<script lang="ts">
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Alert } from '$lib/components';
    import { calculateExcess, plansInfo, tierToPlan, type Tier } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Button } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { formatNum } from '$lib/helpers/string';
    import { onMount } from 'svelte';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { BillingPlan } from '$lib/constants';
    import { tooltip } from '$lib/actions/tooltip';

    export let tier: Tier;
    export let members: number;

    const plan = $plansInfo?.get(tier);
    let excess: {
        bandwidth?: number;
        storage?: number;
        users?: number;
        executions?: number;
        members?: number;
    } = null;
    let usage: OrganizationUsage = null;
    let showExcess = false;

    onMount(async () => {
        usage = await sdk.forConsole.billing.listUsage(
            $organization.$id,
            $organization.billingCurrentInvoiceDate,
            new Date().toISOString()
        );
        excess = calculateExcess(usage, plan, members);
        showExcess = Object.values(excess).some((value) => value > 0);
    });
</script>

{#if showExcess}
    <Alert type="error" {...$$restProps}>
        <svelte:fragment slot="title">
            Your {tierToPlan($organization.billingPlan).name} plan subscription will end on {toLocaleDate(
                $organization.billingNextInvoiceDate
            )}
        </svelte:fragment>
        Following payment of your final invoice, your organization will switch to the {tierToPlan(
            BillingPlan.FREE
        ).name} plan. {#if excess?.members > 0}All team members except the owner will be removed on
            that date.{/if} Service disruptions may occur unless resource usage is reduced.
        <!-- Any executions, bandwidth, or messaging usage will be reset at that time. -->
        <svelte:fragment slot="buttons">
            <Button
                text
                external
                href="https://appwrite.io/docs/advanced/platform/free#reaching-resource-limits">
                Learn more
            </Button>
        </svelte:fragment>
    </Alert>

    <TableScroll noMargin dense class="u-margin-block-start-16">
        <TableHeader>
            <TableCellHead>Resource</TableCellHead>
            <TableCellHead>Free limit</TableCellHead>
            <TableCellHead>
                Excess usage <span
                    use:tooltip={{ content: 'Metrics are estimates updated every 24 hours' }}
                    class="icon-info"></span>
            </TableCellHead>
        </TableHeader>
        <TableBody>
            {#if excess?.members}
                <TableRow>
                    <TableCellText title="members">Organization members</TableCellText>
                    <TableCellText title="limit">{plan.members} members</TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger u-flex u-cross-center u-gap-4">
                            <span class="icon-arrow-up" />
                            {excess?.members} members
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
            {#if excess?.storage}
                <TableRow>
                    <TableCellText title="storage">Storage</TableCellText>
                    <TableCellText title="limit">{plan.storage} GB</TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger">
                            <span class="icon-arrow-up" />
                            {humanFileSize(excess?.storage).value}
                            {humanFileSize(excess?.storage).unit}
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
            {#if excess?.executions}
                <TableRow>
                    <TableCellText title="executions">Function executions</TableCellText>
                    <TableCellText title="limit">
                        {abbreviateNumber(plan.executions)} executions
                    </TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger">
                            <span class="icon-arrow-up" />
                            <span
                                title={excess?.executions
                                    ? excess.executions.toString()
                                    : 'executions'}>
                                {formatNum(excess?.executions)} executions
                            </span>
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
            {#if excess?.users}
                <TableRow>
                    <TableCellText title="users">Users</TableCellText>
                    <TableCellText title="limit">
                        {abbreviateNumber(plan.users)} users
                    </TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger">
                            <span class="icon-arrow-up" />
                            <span title={excess?.users ? excess.users.toString() : 'users'}>
                                {formatNum(excess?.users)} users
                            </span>
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
        </TableBody>
    </TableScroll>
{/if}
