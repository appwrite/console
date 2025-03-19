<script lang="ts">
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
    import { Alert, Icon, Table, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

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
    <Alert.Inline
        status="error"
        title={`Your ${tierToPlan($organization.billingPlan).name} plan subscription will end on ${toLocaleDate(
            $organization.billingNextInvoiceDate
        )}`}>
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
    </Alert.Inline>

    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Resource</Table.Header.Cell>
            <Table.Header.Cell>Free limit</Table.Header.Cell>
            <Table.Header.Cell>
                Excess usage <Tooltip maxWidth="fit-content"
                    ><Icon icon={IconInfo} />
                    <span slot="tooltip">Metrics are estimates updated every 24 hours</span>
                </Tooltip>
            </Table.Header.Cell>
        </svelte:fragment>
        {#if excess?.members}
            <Table.Row>
                <Table.Cell>Organization members</Table.Cell>
                <Table.Cell>{plan.members} members</Table.Cell>
                <Table.Cell>
                    <p class="u-color-text-danger u-flex u-cross-center u-gap-4">
                        <span class="icon-arrow-up" />
                        {excess?.members} members
                    </p>
                </Table.Cell>
            </Table.Row>
        {/if}
        {#if excess?.storage}
            <Table.Row>
                <Table.Cell>Storage</Table.Cell>
                <Table.Cell>{plan.storage} GB</Table.Cell>
                <Table.Cell>
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up" />
                        {humanFileSize(excess?.storage).value}
                        {humanFileSize(excess?.storage).unit}
                    </p>
                </Table.Cell>
            </Table.Row>
        {/if}
        {#if excess?.executions}
            <Table.Row>
                <Table.Cell>Function executions</Table.Cell>
                <Table.Cell>
                    {abbreviateNumber(plan.executions)} executions
                </Table.Cell>
                <Table.Cell>
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up" />
                        <span
                            title={excess?.executions
                                ? excess.executions.toString()
                                : 'executions'}>
                            {formatNum(excess?.executions)} executions
                        </span>
                    </p>
                </Table.Cell>
            </Table.Row>
        {/if}
        {#if excess?.users}
            <Table.Row>
                <Table.Cell>Users</Table.Cell>
                <Table.Cell>
                    {abbreviateNumber(plan.users)} users
                </Table.Cell>
                <Table.Cell>
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up" />
                        <span title={excess?.users ? excess.users.toString() : 'users'}>
                            {formatNum(excess?.users)} users
                        </span>
                    </p>
                </Table.Cell>
            </Table.Row>
        {/if}
    </Table.Root>
{/if}
