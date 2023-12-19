<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, CardGrid, Heading, ProgressBarBig } from '$lib/components';
    import { getServiceLimit, showUsageRatesModal, tierToPlan } from '$lib/stores/billing';
    import { wizard } from '$lib/stores/wizard';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { bytesToSize, humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BarChart } from '$lib/charts';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import ProjectBreakdown from './ProjectBreakdown.svelte';
    import { formatNum } from '$lib/helpers/string';
    import { accumulateFromEndingTotal, total } from '$lib/layout/usage.svelte';
    import type { OrganizationUsage } from '$lib/sdk/billing';

    export let data;

    const tier = data?.currentInvoice?.tier ?? $organization?.billingPlan;
    const plan = tierToPlan(tier).name;

    // let invoice = null;
    // async function handlePeriodChange() {
    //     const target = invoice
    //         ? `/console/organization-${$organization.$id}/usage/${invoice}`
    //         : `/console/organization-${$organization.$id}/usage`;
    //     if ($page.url.pathname !== target) {
    //         await goto(target);
    //     }
    // }

    // const cycles = data.invoices.invoices.map((invoice) => ({
    //     label: toLocaleDate(invoice.from),
    //     value: invoice.$id
    // }));

    $: project = (data.organizationUsage as OrganizationUsage).projects;
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
                per resource listed below. <button
                    on:click={() => ($showUsageRatesModal = true)}
                    class="link"
                    type="button">Learn more about plan usage limits.</button>
            </p>
        {:else if $organization.billingPlan === 'tier-1'}
            <p class="text">
                On the Pro plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <button
                    on:click={() => ($showUsageRatesModal = true)}
                    class="link"
                    type="button">Learn more about plan usage limits.</button>
            </p>
        {:else if $organization.billingPlan === 'tier-0'}
            <p class="text">
                If you exceed the limits of the {plan} plan, services for your organization's projects
                may be disrupted.
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
        <Heading tag="h6" size="7">Bandwidth</Heading>

        <p class="text">
            Calculated for all bandwidth used across all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            {#if data.organizationUsage.bandwidth}
                {@const current = total(data.organizationUsage.bandwidth)}
                {@const currentHumanized = humanFileSize(current)}
                {@const max = getServiceLimit('bandwidth', tier)}
                <ProgressBarBig
                    currentUnit={currentHumanized.unit}
                    currentValue={currentHumanized.value}
                    maxUnit="GB"
                    maxValue={max.toString()}
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
                <ProjectBreakdown projects={project} metric="bandwidth" {data} />
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

        <p class="text">The total number of users across all projects in your organization.</p>

        <svelte:fragment slot="aside">
            {#if data.organizationUsage.users}
                {@const current = data.organizationUsage.usersTotal}
                {@const max = getServiceLimit('users', tier)}
                <ProgressBarBig
                    currentUnit="Users"
                    currentValue={formatNum(current)}
                    maxUnit="Users"
                    maxValue={formatNum(max)}
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
                                data.organizationUsage.usersTotal
                            )
                        }
                    ]} />
                <ProjectBreakdown projects={project} metric="users" {data} />
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
            Calculated for all functions that are executed in all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            {#if data.organizationUsage.executionsTotal}
                {@const current = data.organizationUsage.executionsTotal}
                {@const max = getServiceLimit('executions', tier)}
                <ProgressBarBig
                    currentUnit="Executions"
                    currentValue={current.toString()}
                    maxUnit="Executions"
                    maxValue={formatNum(max)}
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
                                ...data.organizationUsage.executions.map((e) => [e.date, e.value])
                            ]
                        }
                    ]} />
                <ProjectBreakdown projects={project} metric="executions" {data} />
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
            {#if data.organizationUsage.storageTotal}
                {@const current = data.organizationUsage.storageTotal}
                {@const currentHumanized = humanFileSize(current)}
                {@const max = getServiceLimit('storage', tier)}
                <ProgressBarBig
                    currentUnit={currentHumanized.unit}
                    currentValue={currentHumanized.value}
                    maxUnit="GB"
                    maxValue={max.toString()}
                    progressValue={bytesToSize(current, 'GB')}
                    progressMax={max}
                    minimum={1} />
                <ProjectBreakdown projects={project} metric="storage" {data} />
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

    <p class="text common-section u-color-text-gray">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
