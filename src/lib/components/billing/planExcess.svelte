<script lang="ts">
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
    import { Alert, Icon, Table, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

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

{#if showExcess}
    <Alert.Inline
        status="error"
        title={`  Your organization will switch to ${tierToPlan(BillingPlan.FREE).name} plan on ${toLocaleDate(
            $organization.billingNextInvoiceDate
        )}`}>
        You will retain access to {tierToPlan($organization.billingPlan).name} plan features until your
        billing period ends. After that,
        {#if excess?.members > 0}<span class="u-bold">
                all team members except the owner will be removed,</span>
        {:else}
            <span class="u-bold">your organization will be limited to Free plan resources,</span>
        {/if} and service disruptions may occur if usage exceeds Free plan limits.
    </Alert.Inline>

    <Table.Root columns={3} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Resource</Table.Header.Cell>
            <Table.Header.Cell {root}>Free limit</Table.Header.Cell>
            <Table.Header.Cell {root}>
                Excess usage <Tooltip maxWidth="fit-content"
                    ><Icon icon={IconInfo} />
                    <span slot="tooltip">Metrics are estimates updated every 24 hours</span>
                </Tooltip>
            </Table.Header.Cell>
        </svelte:fragment>
        {#if excess?.members}
            <Table.Row.Base {root}>
                <Table.Cell {root}>Organization members</Table.Cell>
                <Table.Cell {root}>{plan.addons.seats.limit} members</Table.Cell>
                <Table.Cell {root}>
                    <p class="u-color-text-danger u-flex u-cross-center u-gap-4">
                        <span class="icon-arrow-up"></span>
                        {excess?.members} members
                    </p>
                </Table.Cell>
            </Table.Row.Base>
        {/if}
        {#if excess?.storage}
            <Table.Row.Base {root}>
                <Table.Cell {root}>Storage</Table.Cell>
                <Table.Cell {root}>{plan.storage} GB</Table.Cell>
                <Table.Cell {root}>
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up"></span>
                        {humanFileSize(excess?.storage).value}
                        {humanFileSize(excess?.storage).unit}
                    </p>
                </Table.Cell>
            </Table.Row.Base>
        {/if}
        {#if excess?.executions}
            <Table.Row.Base {root}>
                <Table.Cell {root}>Function executions</Table.Cell>
                <Table.Cell {root}>
                    {abbreviateNumber(plan.executions)} executions
                </Table.Cell>
                <Table.Cell {root}>
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up"></span>
                        <span
                            title={excess?.executions
                                ? excess.executions.toString()
                                : 'executions'}>
                            {formatNum(excess?.executions)} executions
                        </span>
                    </p>
                </Table.Cell>
            </Table.Row.Base>
        {/if}
        {#if excess?.users}
            <Table.Row.Base {root}>
                <Table.Cell {root}>Users</Table.Cell>
                <Table.Cell {root}>
                    {abbreviateNumber(plan.users)} users
                </Table.Cell>
                <Table.Cell column="usage" {root}>
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up"></span>
                        <span title={excess?.users ? excess.users.toString() : 'users'}>
                            {formatNum(excess?.users)} users
                        </span>
                    </p>
                </Table.Cell>
            </Table.Row.Base>
        {/if}
    </Table.Root>
{/if}
