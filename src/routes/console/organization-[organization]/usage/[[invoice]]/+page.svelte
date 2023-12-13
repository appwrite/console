<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Heading, ProgressBarBig } from '$lib/components';
    import { getServiceLimit, showUsageRatesModal, tierToPlan } from '$lib/stores/billing';
    import { wizard } from '$lib/stores/wizard';
    import { organization } from '$lib/stores/organization';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { toLocaleDate } from '$lib/helpers/date.js';
    import { bytesToSize, humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BarChart } from '$lib/charts';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import ProjectBreakdown from './ProjectBreakdown.svelte';
    import { last } from '$lib/helpers/array';
    import { formatNum } from '$lib/helpers/string';
    import { total } from '$lib/layout/usage.svelte';

    export let data;

    const tier = data?.currentInvoice?.tier ?? $organization?.billingPlan;
    const plan = tierToPlan(tier).name;

    let invoice = null;

    async function handlePeriodChange() {
        const target = invoice
            ? `/console/organization-${$organization.$id}/usage/${invoice}`
            : `/console/organization-${$organization.$id}/usage`;
        if ($page.url.pathname !== target) {
            await goto(target);
        }
    }

    const cycles = data.invoices.invoices.map((invoice) => ({
        label: toLocaleDate(invoice.from),
        value: invoice.$id
    }));
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

        <div class="u-flex u-gap-8 u-cross-center u-hide">
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
        </div>
    </div>

    <CardGrid>
        <Heading tag="h6" size="7">Bandwidth</Heading>

        <p class="text">
            Calculated for all bandwidth used across all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
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
                                    ? `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                                    : '0'
                        }
                    }
                }}
                series={[
                    {
                        name: 'Bandwidth',
                        data: [...data.organizationUsage.bandwidth.map((e) => [e.date, e.value])],
                        tooltip: {
                            valueFormatter: (value) =>
                                `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                        }
                    }
                ]} />
            <ProjectBreakdown
                projects={data.organizationUsage.projects}
                metric="bandwidth"
                {data} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Users</Heading>

        <p class="text">The total number of users across all projects in your organization.</p>

        <svelte:fragment slot="aside">
            {@const current = last(data.organizationUsage.users)?.value ?? 0}
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
                        data: [...data.organizationUsage.users.map((e) => [e.date, e.value])]
                    }
                ]} />
            <ProjectBreakdown projects={data.organizationUsage.projects} metric="users" {data} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Executions</Heading>

        <p class="text">
            Calculated for all functions that are executed in all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            {@const current = data.organizationUsage.executions}
            {@const max = getServiceLimit('executions', tier)}
            <ProgressBarBig
                currentUnit="Executions"
                currentValue={current.toString()}
                maxUnit="Executions"
                maxValue={formatNum(max)}
                progressValue={current}
                progressMax={max} />
            <ProjectBreakdown
                projects={data.organizationUsage.projects}
                metric="executions"
                {data} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Storage</Heading>

        <p class="text">
            Calculated for all your files, deployments, builds and databases. While in beta, only
            file storage is counted against your plan limits.
        </p>

        <svelte:fragment slot="aside">
            {@const current = data.organizationUsage.storage}
            {@const currentHumanized = humanFileSize(current)}
            {@const max = getServiceLimit('storage', tier)}
            <ProgressBarBig
                currentUnit={currentHumanized.unit}
                currentValue={currentHumanized.value}
                maxUnit="GB"
                maxValue={max.toString()}
                progressValue={bytesToSize(current, 'GB')}
                progressMax={max} />
            <ProjectBreakdown projects={data.organizationUsage.projects} metric="storage" {data} />
        </svelte:fragment>
    </CardGrid>

    <p class="text common-section u-color-text-gray">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
