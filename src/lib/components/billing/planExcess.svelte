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
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { formatNum } from '$lib/helpers/string';
    import { onMount } from 'svelte';
    import type { Aggregation } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { BillingPlan } from '$lib/constants';
    import { tooltip } from '$lib/actions/tooltip';

    export let tier: Tier;

    const plan = $plansInfo?.get(tier);
    let excess: {
        bandwidth?: number;
        storage?: number;
        users?: number;
        executions?: number;
        members?: number;
    } = null;
    let aggregation: Aggregation = null;
    let showExcess = false;

    onMount(async () => {
        aggregation = await sdk.forConsole.billing.getAggregation(
            $organization.$id,
            $organization.billingAggregationId
        );
        excess = calculateExcess(aggregation, plan);
        showExcess = Object.values(excess).some((value) => value > 0);
    });
</script>

<Alert type="warning" {...$$restProps}>
    <svelte:fragment slot="title">
        Your organization will switch to {tierToPlan(BillingPlan.FREE).name} plan on {toLocaleDate(
            $organization.billingNextInvoiceDate
        )}.
    </svelte:fragment>
    {#if !showExcess}
        You will retain access to your {tierToPlan($organization.billingPlan).name} plan features until
        your billing period ends. After that, your organization will be limited to Free plan resources,
        and service disruptions may occur if usage exceeds plan limits.
    {:else}
        You will retain access to {tierToPlan($organization.billingPlan).name} plan features until your
        billing period ends. After that,
        {#if excess?.members > 0}<span class="u-bold">
                all team members except the owner will be removed,</span>
        {/if} and service disruptions may occur if usage exceeds Free plan limits.
    {/if}
</Alert>
{#if showExcess}
    <TableScroll dense class="u-margin-block-start-16">
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
                    <TableCellText title="limit"
                        >{plan.addons.seats.limit || 0} members</TableCellText>
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
