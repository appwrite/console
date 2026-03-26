<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Card } from '$lib/components';
    import {
        showUsageRatesModal,
        billingIdToPlan,
        getChangePlanUrl,
        planHasGroup
    } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BarChart } from '$lib/charts';
    import { formatNum } from '$lib/helpers/string';
    import { base } from '$app/paths';
    import { Icon, Layout, Link, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconChartSquareBar } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';
    import { BillingPlanGroup } from '@appwrite.io/console';

    export let data;

    $: baseRoute = `${base}/project-${page.params.region}-${page.params.project}`;
    $: network = data.usage.network;
    $: users = data.usage.users;
    $: executions = data.usage.executions;
    $: imageTransformations = data.usage.imageTransformations;
    $: screenshotsGenerated = data.usage.screenshotsGenerated;
    $: dbReads = data.usage.databasesReads;
    $: dbWrites = data.usage.databasesWrites;

    $: currentPlanId = data?.currentInvoice?.plan ?? $organization?.billingPlanId;
    $: currentBillingPlan = billingIdToPlan(currentPlanId);
</script>

<Container>
    <div class="u-flex u-cross-center u-main-space-between">
        <Typography.Title>Usage</Typography.Title>

        <!-- always show upgrade on free -->
        {#if planHasGroup(currentBillingPlan, BillingPlanGroup.Starter)}
            <Button href={getChangePlanUrl(data.project.teamId)}>
                <span class="text">Upgrade</span>
            </Button>
        {/if}
    </div>

    <div class="u-flex u-main-space-between common-section u-cross-center">
        {#if planHasGroup(currentBillingPlan, BillingPlanGroup.Scale)}
            <p class="text">
                On the Scale plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Link.Button
                    on:click={() => ($showUsageRatesModal = true)}
                    >Learn more about plan usage limits.</Link.Button>
            </p>
        {:else if planHasGroup(currentBillingPlan, BillingPlanGroup.Pro)}
            <p class="text">
                On the Pro plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Link.Button
                    on:click={() => ($showUsageRatesModal = true)}
                    >Learn more about plan usage limits.</Link.Button>
            </p>
        {:else if planHasGroup(currentBillingPlan, BillingPlanGroup.Starter)}
            <p class="text">
                If you exceed the limits of the {currentBillingPlan.name} plan, services for your projects
                may be disrupted.
                <Link.Anchor href={getChangePlanUrl(data.project.teamId)} class="link"
                    >Upgrade for greater capacity</Link.Anchor
                >.
            </p>
        {/if}
    </div>
    <CardGrid>
        <svelte:fragment slot="title">Bandwidth</svelte:fragment>
        Calculated for all bandwidth used across your project. Resets at the start of each billing cycle.
        <svelte:fragment slot="aside">
            {#if network}
                <BarChart
                    options={{
                        yAxis: {
                            axisLabel: {
                                formatter: (value) =>
                                    value
                                        ? `${humanFileSize(+value).value} ${
                                              humanFileSize(+value).unit
                                          }`
                                        : '0'
                            }
                        }
                    }}
                    series={[
                        {
                            name: 'Bandwidth',
                            data: [...network.map((e) => [e.date, e.value])],
                            tooltip: {
                                valueFormatter: (value) =>
                                    `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                            }
                        }
                    ]} />
            {:else}
                <Card isDashed>
                    <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="title">Users</svelte:fragment>
        User registrations per day in your project.
        <svelte:fragment slot="aside">
            {#if users}
                <BarChart
                    options={{
                        yAxis: {
                            axisLabel: {
                                formatter: formatNum
                            }
                        }
                    }}
                    series={[
                        {
                            name: 'Users',
                            data: [...users.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {:else}
                <Card isDashed>
                    <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="title">Database reads and writes</svelte:fragment>
        Reads and writes per day for this billing period.
        <svelte:fragment slot="aside">
            {#if dbReads || dbWrites}
                <div style:margin-top="-1.5em" style:margin-bottom="-1em">
                    <BarChart
                        options={{
                            yAxis: {
                                axisLabel: {
                                    formatter: formatNum
                                }
                            }
                        }}
                        series={[
                            {
                                name: 'Reads',
                                data: [...dbReads.map((e) => [e.date, e.value])]
                            },
                            {
                                name: 'Writes',
                                data: [...dbWrites.map((e) => [e.date, e.value])]
                            }
                        ]} />
                </div>
            {:else}
                <Card isDashed>
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;"></span>
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="title">Image transformations</svelte:fragment>
        Image transformations per day in your project.
        <svelte:fragment slot="aside">
            {#if imageTransformations}
                <BarChart
                    options={{
                        yAxis: {
                            axisLabel: {
                                formatter: formatNum
                            }
                        }
                    }}
                    series={[
                        {
                            name: 'Image transformations',
                            data: [...imageTransformations.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {:else}
                <Card isDashed>
                    <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="title">Screenshots generated</svelte:fragment>
        Screenshots generated per day in your project.
        <svelte:fragment slot="aside">
            {#if screenshotsGenerated}
                <BarChart
                    options={{
                        yAxis: {
                            axisLabel: {
                                formatter: formatNum
                            }
                        }
                    }}
                    series={[
                        {
                            name: 'Screenshots generated',
                            data: [...screenshotsGenerated.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {:else}
                <Card isDashed>
                    <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="title">Executions</svelte:fragment>
        Function executions per day in this project.
        <svelte:fragment slot="aside">
            {#if executions}
                <BarChart
                    options={{
                        yAxis: {
                            axisLabel: {
                                formatter: formatNum
                            }
                        }
                    }}
                    series={[
                        {
                            name: 'Executions',
                            data: [...executions.map((e) => [e.date, e.value])]
                        }
                    ]} />
                {#if data.usage.executionsBreakdown.length > 0}
                    <Table.Root columns={2} let:root>
                        <svelte:fragment slot="header" let:root>
                            <Table.Header.Cell {root}>Function</Table.Header.Cell>
                            <Table.Header.Cell {root}>Usage</Table.Header.Cell>
                        </svelte:fragment>
                        {#each data.usage.executionsBreakdown as func}
                            <Table.Row.Link
                                href={`${baseRoute}/functions/function-${func.resourceId}`}
                                {root}>
                                <Table.Cell {root}>
                                    {func.name ?? func.resourceId}
                                </Table.Cell>
                                <Table.Cell {root}>
                                    {formatNum(func.value)} executions
                                </Table.Cell>
                            </Table.Row.Link>
                        {/each}
                    </Table.Root>
                {/if}
            {:else}
                <Card isDashed>
                    <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <p class="text u-text-color-gray u-margin-block-start-16">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
