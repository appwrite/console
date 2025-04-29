<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, CardGrid, ProgressBarBig } from '$lib/components';
    import { BarChart, Legend } from '$lib/charts';
    import { Button } from '$lib/elements/forms';
    import { bytesToSize, humanFileSize, mbSecondsToGBHours } from '$lib/helpers/sizeConvertion';
    import {
        getServiceLimit,
        showUsageRatesModal,
        type Tier,
        upgradeURL
    } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import ProjectBreakdown from './ProjectBreakdown.svelte';
    import { formatNum } from '$lib/helpers/string';
    import { accumulateFromEndingTotal, total } from '$lib/layout/usage.svelte';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import TotalMembers from './totalMembers.svelte';
    import { formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { Icon, Layout, Link, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconChartSquareBar, IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let data;

    const tier = data?.plan
        ? (data.plan.$id as Tier)
        : (data?.currentInvoice?.plan ?? $organization?.billingPlan);
    const plan = data?.plan ?? undefined;

    $: projects = (data.organizationUsage as OrganizationUsage).projects;

    $: legendData = [
        { name: 'Reads', value: data.organizationUsage.databasesReadsTotal },
        { name: 'Writes', value: data.organizationUsage.databasesWritesTotal }
    ];
</script>

<Container>
    <div class="u-flex u-cross-center u-main-space-between">
        <Typography.Title>Usage</Typography.Title>

        {#if $organization?.billingPlan === BillingPlan.FREE}
            <Button
                href={$upgradeURL}
                on:click={() => {
                    trackEvent(Click.OrganizationClickUpgrade, {
                        from: 'button',
                        source: 'organization_usage'
                    });
                }}>
                <span class="text">Upgrade</span>
            </Button>
        {/if}
    </div>
    {#if $organization.billingPlan === BillingPlan.SCALE}
        <p class="text">
            On the Scale plan, you'll be charged only for any usage that exceeds the thresholds per
            resource listed below. <Link.Button on:click={() => ($showUsageRatesModal = true)}
                >Learn more</Link.Button>
        </p>
    {:else if $organization.billingPlan === BillingPlan.PRO}
        <p class="text">
            On the Pro plan, you'll be charged only for any usage that exceeds the thresholds per
            resource listed below. <Link.Button on:click={() => ($showUsageRatesModal = true)}
                >Learn more</Link.Button>
        </p>
    {:else if $organization.billingPlan === BillingPlan.FREE}
        <p class="text">
            If you exceed the limits of the Free plan, services for your organization's projects may
            be disrupted.
            <Link.Anchor href={$upgradeURL}>Upgrade for greater capacity</Link.Anchor>.
        </p>
    {/if}

    <CardGrid gap="none">
        <svelte:fragment slot="title">Bandwidth</svelte:fragment>
        Calculated for all bandwidth used across all projects in your organization. Resets at the start
        of each billing cycle.

        <svelte:fragment slot="aside">
            {#if data.organizationUsage.bandwidth}
                {@const current = total(data.organizationUsage.bandwidth)}
                {@const currentHumanized = humanFileSize(current)}
                {@const max = getServiceLimit('bandwidth', tier, plan)}
                <ProgressBarBig
                    currentUnit={currentHumanized.unit}
                    currentValue={currentHumanized.value}
                    maxValue={`/ ${max.toString()} GB used`}
                    progressValue={bytesToSize(current, 'GB')}
                    progressMax={max}
                    showBar={false} />
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
                            data: [
                                ...data.organizationUsage.bandwidth.map((e) => [e.date, e.value])
                            ],
                            tooltip: {
                                valueFormatter: (value) =>
                                    `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                            }
                        }
                    ]} />
                {#if projects?.length > 0}
                    <ProjectBreakdown {projects} metric="bandwidth" {data} />
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

    <CardGrid gap="none">
        <svelte:fragment slot="title">Users</svelte:fragment>
        The total number of users across all projects in your organization.
        <svelte:fragment slot="aside">
            {#if data.organizationUsage.users}
                {@const current = data.organizationUsage.usersTotal}
                {@const max = getServiceLimit('users', tier, plan)}
                <Layout.Stack>
                    <ProgressBarBig
                        currentUnit="Users"
                        currentValue={formatNum(current)}
                        maxUnit="users"
                        maxValue={`/ ${formatNum(max)}`}
                        progressValue={current}
                        progressMax={max}
                        showBar={false} />
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
                                data: accumulateFromEndingTotal(
                                    data.organizationUsage.users,
                                    data.organizationUsage.usersTotal,
                                    new Date()
                                )
                            }
                        ]} />
                    {#if projects?.length > 0}
                        <ProjectBreakdown {projects} metric="users" {data} />
                    {/if}
                </Layout.Stack>
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

    <CardGrid gap="none">
        <svelte:fragment slot="title">Database reads and writes</svelte:fragment>
        The total number of database reads and writes across all projects in your organization.
        <svelte:fragment slot="aside">
            {#if data.organizationUsage.databasesReads || data.organizationUsage.databasesWrites}
                <Layout.Stack>
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
                                data: [
                                    ...(data.organizationUsage.databasesReads ?? []).map((e) => [
                                        e.date,
                                        e.value
                                    ])
                                ]
                            },
                            {
                                name: 'Writes',
                                data: [
                                    ...(data.organizationUsage.databasesWrites ?? []).map((e) => [
                                        e.date,
                                        e.value
                                    ])
                                ]
                            }
                        ]} />

                    <Legend {legendData} numberFormat="abbreviate" decimalsForAbbreviate={2} />

                    {#if projects?.length > 0}
                        <ProjectBreakdown
                            {data}
                            {projects}
                            databaseOperationMetric={['databasesReads', 'databasesWrites']} />
                    {/if}
                </Layout.Stack>
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

    <CardGrid gap="none">
        <svelte:fragment slot="title">Image transformations</svelte:fragment>
        Calculated for all functions that are executed in all projects in your organization.
        <p class="text">
            The total number of unique image transformations across all projects in your
            organization. <a
                href="https://appwrite.io/docs/advanced/platform/image-transformations"
                class="link">Learn more</a
            >.
        </p>
        <svelte:fragment slot="aside">
            {#if data.organizationUsage.imageTransformationsTotal}
                {@const current = data.organizationUsage.imageTransformationsTotal}
                <ProgressBarBig
                    currentUnit="Transformations"
                    currentValue={formatNum(current)}
                    progressValue={current}
                    showBar={false} />
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
                            data: [
                                ...(data.organizationUsage.imageTransformations ?? []).map((e) => [
                                    e.date,
                                    e.value
                                ])
                            ]
                        }
                    ]} />
                {#if projects?.length > 0}
                    <ProjectBreakdown {projects} metric="imageTransformations" {data} />
                {/if}
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

    <CardGrid gap="none">
        <svelte:fragment slot="title">Executions</svelte:fragment>
        Calculated for all functions that are executed in all projects in your organization.
        <svelte:fragment slot="aside">
            {#if data.organizationUsage.executions}
                {@const current = data.organizationUsage.executionsTotal}
                {@const max = getServiceLimit('executions', tier, plan)}
                <Layout.Stack>
                    <ProgressBarBig
                        currentUnit="Executions"
                        currentValue={formatNum(current)}
                        maxValue={`/ ${formatNum(max)} executions used`}
                        progressValue={current}
                        progressMax={max}
                        showBar={false} />
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
                                data: [
                                    ...data.organizationUsage.executions.map((e) => [
                                        e.date,
                                        e.value
                                    ])
                                ]
                            }
                        ]} />
                    {#if projects?.length > 0}
                        <ProjectBreakdown {projects} metric="executions" {data} />
                    {/if}
                </Layout.Stack>
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

    <CardGrid gap="none">
        <svelte:fragment slot="title">Storage</svelte:fragment>
        Calculated for all your files, deployments, builds, databases and backups.

        <svelte:fragment slot="aside">
            {#if data.organizationUsage.storageTotal}
                {@const current = data.organizationUsage.storageTotal}
                {@const currentHumanized = humanFileSize(current)}
                {@const max = getServiceLimit('storage', tier, plan)}
                {@const progressBarStorageDate = [
                    {
                        size: bytesToSize(data.organizationUsage.filesStorageTotal, 'GB'),
                        color: '#85DBD8',
                        tooltip: {
                            title: 'File storage',
                            label: `${Math.round(bytesToSize(data.organizationUsage.filesStorageTotal, 'GB') * 100) / 100}GB`
                        }
                    },
                    {
                        size: bytesToSize(data.organizationUsage.backupsStorageTotal, 'GB'),
                        color: '#68A3FE',
                        tooltip: {
                            title: 'Backups storage',
                            label: `${Math.round(bytesToSize(data.organizationUsage.backupsStorageTotal, 'GB') * 100) / 100}MB`
                        }
                    },
                    {
                        size: bytesToSize(data.organizationUsage.deploymentsStorageTotal, 'GB'),
                        color: '#7C67FE',
                        tooltip: {
                            title: 'Deployments storage',
                            label: `${Math.round(bytesToSize(data.organizationUsage.deploymentsStorageTotal, 'GB') * 100) / 100}GB`
                        }
                    },
                    {
                        size: bytesToSize(data.organizationUsage.buildsStorageTotal, 'GB'),
                        color: '#FE9567',
                        tooltip: {
                            title: 'Builds storage',
                            label: `${Math.round(bytesToSize(data.organizationUsage.buildsStorageTotal, 'GB') * 100) / 100}GB`
                        }
                    }
                ]}
                <Layout.Stack>
                    <ProgressBarBig
                        currentUnit={currentHumanized.unit}
                        currentValue={currentHumanized.value}
                        maxValue={`/ ${max.toString()} GB used`}
                        progressValue={bytesToSize(current, 'GB')}
                        progressMax={max}
                        progressBarData={progressBarStorageDate} />
                    {#if projects?.length > 0}
                        <ProjectBreakdown {projects} metric="storage" {data} />
                    {/if}
                </Layout.Stack>
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

    <CardGrid gap="none">
        <svelte:fragment slot="title">GB hours</svelte:fragment>
        GB hours represent the memory usage (in gigabytes) of your function executions and builds, multiplied
        by the total execution time (in hours).

        <svelte:fragment slot="aside">
            {#if data.organizationUsage.storageTotal}
                {@const totalGbHours = mbSecondsToGBHours(
                    data.organizationUsage.executionsMBSecondsTotal +
                        data.organizationUsage.buildsMBSecondsTotal
                )}
                {@const progressBarStorageDate = [
                    {
                        size: mbSecondsToGBHours(data.organizationUsage.executionsMBSecondsTotal),
                        color: '#85DBD8',
                        tooltip: {
                            title: 'Executions',
                            label: `${(Math.round(mbSecondsToGBHours(data.organizationUsage.executionsMBSecondsTotal) * 100) / 100).toLocaleString('en-US')} GB hours`
                        }
                    },
                    {
                        size: mbSecondsToGBHours(data.organizationUsage.buildsMBSecondsTotal),
                        color: '#FE9567',
                        tooltip: {
                            title: 'Deployments',
                            label: `${(Math.round(mbSecondsToGBHours(data.organizationUsage.buildsMBSecondsTotal) * 100) / 100).toLocaleString('en-US')} GB hours`
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
                    <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}
        </svelte:fragment>
    </CardGrid>

    <CardGrid gap="none">
        <svelte:fragment slot="title">Phone OTP</svelte:fragment>
        OTPs are billed per SMS message, with rates varying by recipient country. For a detailed cost
        breakdown, see the
        <Link.Anchor href="https://appwrite.io/docs/advanced/platform/phone-otp"
            >pricing page</Link.Anchor
        >.
        <svelte:fragment slot="aside">
            {#if data.organizationUsage.authPhoneTotal}
                <Layout.Stack>
                    <Layout.Stack direction="row">
                        <Layout.Stack gap="s" direction="row" alignItems="baseline">
                            <Typography.Title>
                                {formatNumberWithCommas(data.organizationUsage.authPhoneTotal)}
                            </Typography.Title>
                            <Typography.Text>OTPs</Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack
                            gap="xs"
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-end">
                            <Typography.Text>Estimated cost</Typography.Text>
                            <Typography.Text color="--fgcolor-neutral-primary">
                                {formatCurrency(data.organizationUsage.authPhoneEstimate)}
                            </Typography.Text>
                            <Tooltip maxWidth="200px">
                                <Icon icon={IconInfo} />
                                <svelte:fragment slot="tooltip">
                                    The first 10 messages each month are provided at no cost.
                                    Pricing may vary as it depends on telecom rates and vendor
                                    agreements.
                                </svelte:fragment>
                            </Tooltip>
                        </Layout.Stack>
                    </Layout.Stack>

                    {#if projects?.length > 0}
                        <ProjectBreakdown
                            {projects}
                            metric="authPhoneTotal"
                            estimate="authPhoneEstimate"
                            {data} />
                    {/if}
                </Layout.Stack>
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

    <TotalMembers members={data?.organizationMembers} />

    <p class="text common-section u-color-text-gray">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
