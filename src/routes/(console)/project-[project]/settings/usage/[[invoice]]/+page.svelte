<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Card, ProgressBarBig } from '$lib/components';
    import { showUsageRatesModal, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { bytesToSize, humanFileSize, mbSecondsToGBHours } from '$lib/helpers/sizeConvertion';
    import { BarChart, Legend } from '$lib/charts';
    import { formatNum } from '$lib/helpers/string';
    import { total } from '$lib/layout/usage.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { base } from '$app/paths';
    import { formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { getCountryName } from '$lib/helpers/diallingCodes.js';
    import { Accordion, Icon, Layout, Link, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconChartSquareBar } from '@appwrite.io/pink-icons-svelte';

    export let data;

    $: baseRoute = `${base}/project-${data.project.$id}`;
    $: network = data.usage.network;
    $: users = data.usage.users;
    $: usersTotal = data.usage.usersTotal;
    $: executions = data.usage.executions;
    $: executionsTotal = data.usage.executionsTotal;
    $: storage =
        data.usage.filesStorageTotal +
        data.usage.deploymentsStorageTotal +
        data.usage.buildsStorageTotal;
    $: imageTransformations = data.usage.imageTransformations;
    $: imageTransformationsTotal = data.usage.imageTransformationsTotal;
    $: dbReads = data.usage.databasesReads;
    $: dbWrites = data.usage.databasesWrites;

    $: legendData = [
        { name: 'Reads', value: data.usage.databasesReadsTotal },
        { name: 'Writes', value: data.usage.databasesWritesTotal }
    ];

    const tier = data?.currentInvoice?.plan ?? $organization?.billingPlan;
    const plan = tierToPlan(tier).name;
</script>

<Container>
    <div class="u-flex u-cross-center u-main-space-between">
        <Typography.Title>Usage</Typography.Title>

        {#if $organization?.billingPlan === BillingPlan.FREE}
            <Button href={$upgradeURL}>
                <span class="text">Upgrade</span>
            </Button>
        {/if}
    </div>
    <div class="u-flex u-main-space-between common-section u-cross-center">
        {#if $organization.billingPlan === BillingPlan.SCALE}
            <p class="text">
                On the Scale plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Link.Button
                    on:click={() => ($showUsageRatesModal = true)}
                    >Learn more about plan usage limits.</Link.Button>
            </p>
        {:else if $organization.billingPlan === BillingPlan.PRO}
            <p class="text">
                On the Pro plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Link.Button
                    on:click={() => ($showUsageRatesModal = true)}
                    >Learn more about plan usage limits.</Link.Button>
            </p>
        {:else if $organization.billingPlan === BillingPlan.FREE}
            <p class="text">
                If you exceed the limits of the {plan} plan, services for your projects may be disrupted.
                <Link.Anchor href={$upgradeURL} class="link"
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
                {@const humanized = humanFileSize(total(network))}
                <Layout.Stack gap="s" direction="row" alignItems="baseline">
                    <Typography.Title>
                        {humanized.value}
                    </Typography.Title>
                    <Typography.Text>{humanized.unit}</Typography.Text>
                </Layout.Stack>
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
        Total user in your project.
        <svelte:fragment slot="aside">
            {#if users}
                {@const current = formatNum(usersTotal)}
                <Layout.Stack gap="s" direction="row" alignItems="baseline">
                    <Typography.Title>
                        {current}
                    </Typography.Title>
                    <Typography.Text>Users</Typography.Text>
                </Layout.Stack>
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
        Total database reads and writes in your project.
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

                <Legend {legendData} numberFormat="abbreviate" decimalsForAbbreviate={2} />
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
        Total unique image transformations in your project.
        <svelte:fragment slot="aside">
            {#if imageTransformations}
                {@const current = formatNum(imageTransformationsTotal)}
                <div class="u-flex u-flex-vertical">
                    <div class="u-flex u-main-space-between">
                        <p>
                            <span class="heading-level-4">{current}</span>
                            <span class="body-text-1 u-bold">Transformations</span>
                        </p>
                    </div>
                </div>
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
        <svelte:fragment slot="title">Executions</svelte:fragment>
        Calculated for all functions that are executed in all projects in your project.
        <svelte:fragment slot="aside">
            {#if executions}
                {@const current = formatNum(executionsTotal)}
                <Layout.Stack gap="s" direction="row" alignItems="baseline">
                    <Typography.Title>
                        {current}
                    </Typography.Title>
                    <Typography.Text>Executions</Typography.Text>
                </Layout.Stack>
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
    <CardGrid>
        <svelte:fragment slot="title">Storage</svelte:fragment>
        Calculated for all your files, deployments, builds, databases and backups.
        <svelte:fragment slot="aside">
            {#if storage}
                {@const humanized = humanFileSize(storage)}
                {@const progressBarStorageDate = [
                    {
                        size: bytesToSize(data.usage.filesStorageTotal, 'MB'),
                        color: '#85DBD8',
                        tooltip: {
                            title: 'File storage',
                            label: `${Math.round(bytesToSize(data.usage.filesStorageTotal, 'MB') * 100) / 100}MB`
                        }
                    },
                    {
                        size: bytesToSize(data.usage.deploymentsStorageTotal, 'MB'),
                        color: '#7C67FE',
                        tooltip: {
                            title: 'Deployments storage',
                            label: `${Math.round(bytesToSize(data.usage.deploymentsStorageTotal, 'MB') * 100) / 100}MB`
                        }
                    },
                    {
                        size: bytesToSize(data.usage.buildsStorageTotal, 'MB'),
                        color: '#FE9567',
                        tooltip: {
                            title: 'Builds storage',
                            label: `${Math.round(bytesToSize(data.usage.buildsStorageTotal, 'MB') * 100) / 100}MB`
                        }
                    }
                ]}
                <Layout.Stack gap="s" direction="row" alignItems="baseline">
                    <Typography.Title>
                        {humanized.value}
                    </Typography.Title>
                    <Typography.Text>{humanized.unit}</Typography.Text>
                </Layout.Stack>
                <ProgressBarBig
                    progressValue={bytesToSize(storage, 'MB')}
                    progressMax={bytesToSize(storage, 'MB')}
                    progressBarData={progressBarStorageDate} />
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
        <svelte:fragment slot="title">GB hours</svelte:fragment>
        GB hours represent the memory usage (in gigabytes) of your function executions and builds, multiplied
        by the total execution time (in hours).
        <svelte:fragment slot="aside">
            {#if data.usage.executionsMbSecondsTotal}
                {@const totalGbHours = mbSecondsToGBHours(
                    data.usage.executionsMbSecondsTotal + data.usage.buildsMbSecondsTotal
                )}
                {@const progressBarStorageDate = [
                    {
                        size: mbSecondsToGBHours(data.usage.executionsMbSecondsTotal),
                        color: '#85DBD8',
                        tooltip: {
                            title: 'Executions',
                            label: `${(Math.round(mbSecondsToGBHours(data.usage.executionsMbSecondsTotal) * 100) / 100).toLocaleString('en-US')} GB hours`
                        }
                    },
                    {
                        size: mbSecondsToGBHours(data.usage.buildsMbSecondsTotal),
                        color: '#FE9567',
                        tooltip: {
                            title: 'Deployments',
                            label: `${(Math.round(mbSecondsToGBHours(data.usage.buildsMbSecondsTotal) * 100) / 100).toLocaleString('en-US')} GB hours`
                        }
                    }
                ]}
                <Layout.Stack gap="s" direction="row" alignItems="baseline">
                    <Typography.Title>
                        {(Math.ceil(totalGbHours * 100) / 100).toLocaleString('en-US')}
                    </Typography.Title>
                    <Typography.Text>GB hours</Typography.Text>
                </Layout.Stack>
                <ProgressBarBig
                    progressMax={totalGbHours}
                    progressValue={totalGbHours}
                    progressBarData={progressBarStorageDate} />
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
        <svelte:fragment slot="title">Phone OTP</svelte:fragment>
        Calculated for all Phone OTP sent across your project. Resets at the start of each billing cycle.<br />
        You will not be charged for Phone OTPs before February 10th.
        <svelte:fragment slot="aside">
            {#if data.usage.authPhoneTotal}
                <div class="u-flex u-main-space-between">
                    <Layout.Stack gap="s" direction="row" alignItems="baseline">
                        <Typography.Title>
                            {formatNumberWithCommas(data.usage.authPhoneTotal)}
                        </Typography.Title>
                        <Typography.Text>OTPs</Typography.Text>
                    </Layout.Stack>
                    <p class="u-flex u-gap-8 u-cross-center">
                        <span class="u-color-text-offline">Estimated cost</span>
                        <span class="body-text-2">
                            {formatCurrency(data.usage.authPhoneEstimate)}
                        </span>
                    </p>
                </div>
                {#if data.usage.authPhoneCountryBreakdown.length > 0}
                    <Accordion title="Region breakdown">
                        <Table.Root columns={3} let:root>
                            <svelte:fragment slot="header" let:root>
                                <Table.Header.Cell {root}>Region</Table.Header.Cell>
                                <Table.Header.Cell {root}>Amount</Table.Header.Cell>
                                <Table.Header.Cell {root}>Estimated cost</Table.Header.Cell>
                            </svelte:fragment>
                            {#each data.usage.authPhoneCountryBreakdown as phone}
                                <Table.Row.Base {root}>
                                    <Table.Cell {root}>
                                        {getCountryName(phone.name)}
                                    </Table.Cell>
                                    <Table.Cell {root}>
                                        {formatNumberWithCommas(phone.value)}
                                    </Table.Cell>
                                    <Table.Cell {root}>
                                        {formatCurrency(phone.estimate)}
                                    </Table.Cell>
                                </Table.Row.Base>
                            {/each}
                        </Table.Root>
                    </Accordion>
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
