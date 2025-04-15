<script lang="ts">
    import { base } from '$app/paths';
    import { BarChart, Legend } from '$lib/charts';
    import { Card, CardGrid, Heading, ProgressBarBig } from '$lib/components';
    import Collapsible from '$lib/components/collapsible.svelte';
    import CollapsibleItem from '$lib/components/collapsibleItem.svelte';
    import { BillingPlan } from '$lib/constants.js';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow,
        TableRowLink
    } from '$lib/elements/table';
    import { getCountryName } from '$lib/helpers/diallingCodes.js';
    import { formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { bytesToSize, humanFileSize, mbSecondsToGBHours } from '$lib/helpers/sizeConvertion';
    import { formatNum } from '$lib/helpers/string';
    import { Container } from '$lib/layout';
    import { total } from '$lib/layout/usage.svelte';
    import { showUsageRatesModal, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';

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

    // let invoice = null;
    // async function handlePeriodChange() {
    //     const target = invoice ? `${base}/settings/usage/${invoice}` : `${base}/settings/usage`;
    //     if ($page.url.pathname !== target) {
    //         await goto(target);
    //     }
    // }

    // const cycles = data.invoices.invoices.map((invoice) => ({
    //     label: toLocaleDate(invoice.from),
    //     value: invoice.$id
    // }));
</script>

<Container>
    <div class="u-flex u-cross-center u-main-space-between">
        <Heading tag="h2" size="5">Usage</Heading>

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
                per resource listed below. <Button
                    on:click={() => ($showUsageRatesModal = true)}
                    link>Learn more about plan usage limits.</Button>
            </p>
        {:else if $organization.billingPlan === BillingPlan.PRO}
            <p class="text">
                On the Pro plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Button
                    on:click={() => ($showUsageRatesModal = true)}
                    link>Learn more about plan usage limits.</Button>
            </p>
        {:else if $organization.billingPlan === BillingPlan.FREE}
            <p class="text">
                If you exceed the limits of the {plan} plan, services for your projects may be disrupted.
                <a href={$upgradeURL} class="link">Upgrade for greater capacity</a>.
            </p>
        {/if}

        <!--<div class="u-flex u-gap-8 u-cross-center">
            <p class="text">Usage period:</p>
            <InputSelect
                wrapperTag="div"
                id="period"
                label="Usage period"
                showLabel={false}
                bind:value={invoice}
                on:change={handlePeriodChange}
                options={[
                    {
                        label: 'Current billing cycle',
                        value: null
                    },
                    ...cycles
                ]} />
                </div>-->
    </div>
    <CardGrid>
        <Heading tag="h4" size="7">Bandwidth</Heading>
        <p class="text">
            Calculated for all bandwidth used across your project. Resets at the start of each
            billing cycle.
        </p>
        <svelte:fragment slot="aside">
            {#if network}
                {@const humanized = humanFileSize(total(network))}
                <div class="u-flex u-gap-8 u-cross-baseline">
                    <Heading tag="h5" size="4">{humanized.value}</Heading>
                    <Heading tag="h6" size="6">{humanized.unit}</Heading>
                </div>
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
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Users</Heading>

        <p class="text">Total user in your project.</p>

        <svelte:fragment slot="aside">
            {#if users}
                {@const current = formatNum(usersTotal)}
                <div class="u-flex u-flex-vertical">
                    <div class="u-flex u-main-space-between">
                        <p>
                            <span class="heading-level-4">{current}</span>
                            <span class="body-text-1 u-bold">Users</span>
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
                            name: 'Users',
                            data: [...users.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {:else}
                <Card isDashed>
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Database reads and writes</Heading>

        <p class="text">Total database reads and writes in your project.</p>

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
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Image transformations</Heading>

        <p class="text">Total unique image transformations in your project.</p>

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
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Executions</Heading>

        <p class="text">
            Calculated for all functions that are executed in all projects in your project.
        </p>

        <svelte:fragment slot="aside">
            {#if executions}
                {@const current = formatNum(executionsTotal)}
                <div class="u-flex u-flex-vertical">
                    <div class="u-flex u-main-space-between">
                        <p>
                            <span class="heading-level-4">{current}</span>
                            <span class="body-text-1 u-bold">Executions</span>
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
                            name: 'Executions',
                            data: [...executions.map((e) => [e.date, e.value])]
                        }
                    ]} />
                {#if data.usage.executionsBreakdown.length > 0}
                    <Table noMargin noStyles style="table-layout: auto">
                        <TableHeader>
                            <TableCellHead>Function</TableCellHead>
                            <TableCellHead>Usage</TableCellHead>
                            <TableCellHead />
                        </TableHeader>
                        <TableBody>
                            {#each data.usage.executionsBreakdown as func}
                                <TableRowLink
                                    href={`${baseRoute}/functions/function-${func.resourceId}`}>
                                    <TableCell title="Function">
                                        {func.name ?? func.resourceId}
                                    </TableCell>
                                    <TableCell title="Usage">
                                        {formatNum(func.value)} executions
                                    </TableCell>
                                    <TableCell right={true}>
                                        <span class="icon-cheveron-right u-cross-child-center" />
                                    </TableCell>
                                </TableRowLink>
                            {/each}
                        </TableBody>
                    </Table>
                {/if}
            {:else}
                <Card isDashed>
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Storage</Heading>

        <p class="text">
            Calculated for all your files, deployments, builds, databases and backups.
        </p>

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
                <div class="u-flex u-flex-vertical">
                    <div class="u-flex u-main-space-between">
                        <p>
                            <span class="heading-level-4">{humanized.value}</span>
                            <span class="body-text-1 u-bold">{humanized.unit}</span>
                        </p>
                    </div>
                </div>
                <ProgressBarBig
                    progressValue={bytesToSize(storage, 'MB')}
                    progressMax={bytesToSize(storage, 'MB')}
                    progressBarData={progressBarStorageDate} />
            {:else}
                <Card isDashed>
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">GB hours</Heading>

        <p class="text">
            GB hours represent the memory usage (in gigabytes) of your function executions and
            builds, multiplied by the total execution time (in hours).
        </p>
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
                <div class="u-flex u-flex-vertical">
                    <div class="u-flex u-main-space-between">
                        <p>
                            <span class="heading-level-4"
                                >{(Math.ceil(totalGbHours * 100) / 100).toLocaleString(
                                    'en-US'
                                )}</span>
                            <span class="body-text-1 u-bold">{`GB hours`}</span>
                        </p>
                    </div>
                </div>
                <ProgressBarBig
                    progressMax={totalGbHours}
                    progressValue={totalGbHours}
                    progressBarData={progressBarStorageDate} />
            {:else}
                <Card isDashed>
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Phone OTP</Heading>
        <p class="text">
            Calculated for all Phone OTP sent across your project. Resets at the start of each
            billing cycle.
        </p>
        <svelte:fragment slot="aside">
            {#if data.usage.authPhoneTotal}
                <div class="u-flex u-main-space-between">
                    <p>
                        <span class="heading-level-4"
                            >{formatNumberWithCommas(data.usage.authPhoneTotal)}</span>
                        <span class="body-text-1 u-bold">OTPs</span>
                    </p>
                    <p class="u-flex u-gap-8 u-cross-center">
                        <span class="u-color-text-offline">Estimated cost</span>
                        <span class="body-text-2">
                            {formatCurrency(data.usage.authPhoneEstimate)}
                        </span>
                    </p>
                </div>
                {#if data.usage.authPhoneCountryBreakdown.length > 0}
                    <Collapsible>
                        <CollapsibleItem>
                            <svelte:fragment slot="title">Region breakdown</svelte:fragment>
                            <Table noMargin noStyles style="table-layout: auto">
                                <TableHeader>
                                    <TableCellHead>Region</TableCellHead>
                                    <TableCellHead>Amount</TableCellHead>
                                    <TableCellHead>Estimated cost</TableCellHead>
                                </TableHeader>
                                <TableBody>
                                    {#each data.usage.authPhoneCountryBreakdown as phone}
                                        <TableRow>
                                            <TableCell title="Region">
                                                {getCountryName(phone.name)}
                                            </TableCell>
                                            <TableCell title="Usage">
                                                {formatNumberWithCommas(phone.value)}
                                            </TableCell>
                                            <TableCell title="Estimated cost">
                                                {formatCurrency(phone.estimate)}
                                            </TableCell>
                                        </TableRow>
                                    {/each}
                                </TableBody>
                            </Table>
                        </CollapsibleItem>
                    </Collapsible>
                {/if}
            {:else}
                <Card isDashed>
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <span
                            class="icon-chart-square-bar text-large"
                            aria-hidden="true"
                            style="font-size: 32px;" />
                        <p class="u-bold">No data to show</p>
                    </div>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <p class="text u-text-color-gray u-margin-block-start-16">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
