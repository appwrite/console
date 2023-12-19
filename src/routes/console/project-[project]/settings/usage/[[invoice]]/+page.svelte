<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Heading, Card } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellLink,
        TableCellHead,
        TableHeader,
        TableRow,
        Table
    } from '$lib/elements/table';
    import { showUsageRatesModal, tierToPlan } from '$lib/stores/billing';
    import { wizard } from '$lib/stores/wizard';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BarChart } from '$lib/charts';
    import { formatNum } from '$lib/helpers/string';
    import { total } from '$lib/layout/usage.svelte';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';

    export let data;

    $: base = `/console/project-${data.project.$id}`;
    $: network = data.usage.network;
    $: users = data.usage.users;
    $: usersTotal = data.usage.usersTotal;
    $: executions = data.usage.executions;
    $: executionsTotal = data.usage.executionsTotal;
    $: storage = data.usage.filesStorageTotal;

    const tier = data?.currentInvoice?.tier ?? $organization?.billingPlan;
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

        {#if $organization?.billingPlan === 'tier-0'}
            <Button on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                <span class="text">Upgrade</span>
            </Button>
        {/if}
    </div>
    <div class="u-flex u-main-space-between common-section u-cross-center">
        {#if $organization.billingPlan === 'tier-2'}
            <p class="text">
                On the Scale plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Button
                    on:click={() => ($showUsageRatesModal = true)}
                    link>Learn more about plan usage limits.</Button>
            </p>
        {:else if $organization.billingPlan === 'tier-1'}
            <p class="text">
                On the Pro plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <Button
                    on:click={() => ($showUsageRatesModal = true)}
                    link>Learn more about plan usage limits.</Button>
            </p>
        {:else if $organization.billingPlan === 'tier-0'}
            <p class="text">
                If you exceed the limits of the {plan} plan, services for your projects may be disrupted.
                <button
                    on:click={() => wizard.start(ChangeOrganizationTierCloud)}
                    class="link"
                    type="button">Upgrade for greater capacity</button
                >.
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
        <p class="text">Calculated for all bandwidth used in your project.</p>
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
                    <Table noMargin noStyles>
                        <TableHeader>
                            <TableCellHead width={285}>Function</TableCellHead>
                            <TableCellHead>Usage</TableCellHead>
                            <TableCellHead width={140} />
                        </TableHeader>
                        <TableBody>
                            {#each data.usage.executionsBreakdown as func}
                                <TableRow>
                                    <TableCell title="Function">
                                        {func.name ?? func.resourceId}
                                    </TableCell>
                                    <TableCell title="Usage">
                                        {formatNum(func.value)} executions
                                    </TableCell>
                                    <TableCellLink
                                        href={`${base}/functions/function-${func.resourceId}`}
                                        title="View function">
                                        View function
                                    </TableCellLink>
                                </TableRow>
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
            Calculated for all your files, deployments, builds and databases. While in beta, only
            file storage is counted against your plan limits.
        </p>

        <svelte:fragment slot="aside">
            {#if storage}
                {@const humanized = humanFileSize(storage)}
                <div class="u-flex u-flex-vertical">
                    <div class="u-flex u-main-space-between">
                        <p>
                            <span class="heading-level-4">{humanized.value}</span>
                            <span class="body-text-1 u-bold">{humanized.unit}</span>
                        </p>
                    </div>
                </div>
                {#if data.usage.bucketsBreakdown.length > 0}
                    <Table noMargin noStyles>
                        <TableHeader>
                            <TableCellHead width={285}>Bucket</TableCellHead>
                            <TableCellHead>Usage</TableCellHead>
                            <TableCellHead width={140} />
                        </TableHeader>
                        <TableBody>
                            {#each data.usage.bucketsBreakdown.sort((a, b) => b.value - a.value) as bucket}
                                {@const humanized = humanFileSize(bucket.value)}
                                <TableRow>
                                    <TableCell title="Function">
                                        {bucket.name ?? bucket.resourceId}
                                    </TableCell>
                                    <TableCell title="Usage">
                                        {humanized.value}{humanized.unit}
                                    </TableCell>
                                    <TableCellLink
                                        href={`${base}/storage/bucket-${bucket.resourceId}`}
                                        title="View bucket">
                                        View bucket
                                    </TableCellLink>
                                </TableRow>
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
    <p class="text u-text-color-gray u-margin-block-start-16">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
