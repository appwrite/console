<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, SecondaryTabsItem, SecondaryTabs, Heading, CardGrid } from '$lib/components';
    import { total } from '$lib/layout/usage.svelte';
    import { BarChart } from '$lib/charts';
    import { page } from '$app/stores';
    import { bytesToSize, humanFileSize } from '$lib/helpers/sizeConvertion';
    import { toDecimals } from '$lib/helpers/numbers.js';
    import { showUsageRatesModal, tierToPlan } from '$lib/stores/billing.js';
    import { organization } from '$lib/stores/organization.js';
    import { isCloud } from '$lib/system';

    export let data;

    $: files = data.filesTotal ? normalizeFileSize(data.filesTotal) : null;
    $: executions = data.executionsTotal;
    $: users = data.usersTotal;

    //All file sizes get converted to the bigger file size unit
    function normalizeFileSize(
        files: {
            date: string;
            value: number;
        }[]
    ) {
        console.log(data.filesTotal);
        const sizes = files?.map((e) => e.value);
        const biggestSize = Math.max(...sizes);
        const unit = humanFileSize(biggestSize).unit;
        return {
            data: files?.map((e) => ({
                date: new Date(e.date).toLocaleDateString(),
                value: toDecimals(bytesToSize(e.value, unit), 2)
            })),
            unit
        };
    }
</script>

<Container>
    <div class="u-flex u-main-space-between common-section u-cross-center">
        <Heading tag="h2" size="5">Usage</Heading>
        <SecondaryTabs>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/settings/usage/24h`}
                disabled={($page.params.period ?? '24h') === '24h'}>
                24h
            </SecondaryTabsItem>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/settings/usage/30d`}
                disabled={$page.params.period === '30d'}>
                30d
            </SecondaryTabsItem>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/settings/usage/90d`}
                disabled={$page.params.period === '90d'}>
                90d
            </SecondaryTabsItem>
        </SecondaryTabs>
    </div>
    {#if isCloud}
        <p class="u-margin-block-start-8">
            Project resources contribute to your organization's monthly free usage limits on the {tierToPlan(
                $organization.billingPlan
            ).name} plan.
            <button
                class="link"
                type="button"
                on:click|preventDefault={() => ($showUsageRatesModal = true)}
                >Learn more about usage rates.</button>
        </p>
    {/if}
    <CardGrid>
        <Heading tag="h4" size="7">Bandwidth</Heading>
        <p class="text">Calculated for all bandwidth used across your project.</p>
        <svelte:fragment slot="aside">
            {#if data?.requestsTotal && total(data.requestsTotal)}
                <div class="u-flex u-gap-8 u-cross-baseline">
                    <Heading tag="h5" size="4">{total(data.requestsTotal)}</Heading>
                    <Heading tag="h6" size="6">GB</Heading>
                </div>
                <BarChart
                    series={[
                        {
                            name: 'Bandwidth over time',
                            data: [...data.requestsTotal.map((e) => [e.date, e.value])]
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
        <Heading tag="h4" size="7">Users</Heading>
        <p class="text">The total number of users of your project.</p>
        <svelte:fragment slot="aside">
            {#if total(users)}
                <div class="u-flex u-gap-8 u-cross-baseline">
                    <Heading tag="h5" size="4">{total(users)}</Heading>
                    <Heading tag="h6" size="6">Users</Heading>
                </div>
                <BarChart
                    series={[
                        {
                            name: 'Users over time',
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
        <Heading tag="h4" size="7">Function executions</Heading>
        <p class="text">Calculated for all functions executed in your project.</p>
        <svelte:fragment slot="aside">
            {#if total(executions)}
                <div class="u-flex u-gap-8 u-cross-baseline">
                    <Heading tag="h5" size="4">{total(executions)}</Heading>
                    <Heading tag="h6" size="6">Executions</Heading>
                </div>
                <BarChart
                    series={[
                        {
                            name: 'Executions over time',
                            data: [...executions.map((e) => [e.date, e.value])]
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
    {#if data.filesTotal}
        <CardGrid>
            <Heading tag="h4" size="7">Storage</Heading>
            <p class="text">Calculated for all storage operations in your project.</p>
            <svelte:fragment slot="aside">
                {@const size = humanFileSize(total(data.filesTotal))}
                {#if size}
                    <div class="u-flex u-gap-8 u-cross-baseline">
                        <Heading tag="h5" size="4">{size.value}</Heading>
                        <Heading tag="h6" size="6">{size.unit}</Heading>
                    </div>
                    <BarChart
                        series={[
                            {
                                name: `Storage over time in ${files.unit}`,
                                data: [...files.data]
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
    {/if}
    <p class="text u-text-color-gray u-margin-block-start-16">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
