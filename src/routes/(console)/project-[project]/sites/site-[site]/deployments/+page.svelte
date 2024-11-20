<script lang="ts">
    import { PaginationWithLimit, ViewSelector, EmptyFilter } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { deploymentList } from './store';
    import { Container } from '$lib/layout';
    import { SiteUsageRange, type Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import { Filters } from '$lib/components/filters';
    import { queries, tags } from '$lib/components/filters/store';
    import { View } from '$lib/helpers/load';
    import RedeployModal from './redeployModal.svelte';
    import QuickFilters from './quickFilters.svelte';
    import { Pill } from '$lib/elements';
    import { onMount } from 'svelte';
    import Table from './table.svelte';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import CreateGitDeploymentModal from './createGitDeploymentModal.svelte';
    import UsageCard from './usageCard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { toLocaleDate } from '$lib/helpers/date';

    export let data;

    let showRedeploy = false;
    let showCreateDeployment = false;

    let selectedDeployment: Models.Deployment = null;

    const columns = writable<Column[]>([
        { id: '$id', title: 'Deployment ID', type: 'string', show: true, width: 150 },
        {
            id: 'status',
            title: 'Status',
            type: 'enum',
            show: true,
            width: 110,
            array: true,
            format: 'enum',
            elements: ['ready', 'processing', 'building', 'waiting', 'cancelled', 'failed'],
            filter: false
        },
        {
            id: 'domains',
            title: 'Domains',
            type: 'string',
            show: true,
            width: 15,
            array: true,
            format: 'string',
            filter: false
        },
        {
            id: 'buildTime',
            title: 'Build time',
            type: 'integer',
            show: true,
            width: 90,
            elements: [
                {
                    value: 15,
                    label: 'more than 15 seconds'
                },
                {
                    value: 60,
                    label: 'more than 1 minute'
                },
                {
                    value: 5 * 60,
                    label: 'more than 5 minutes'
                }
            ],
            filter: false
        },
        {
            id: 'size',
            title: 'Total size',
            type: 'integer',
            show: true,
            width: 140,
            elements: [
                {
                    value: 2 * 1000 * 1000,
                    label: 'more than 2MB'
                },
                {
                    value: 10 * 1000 * 1000,
                    label: 'more than 10MB'
                },
                {
                    value: 50 * 1000 * 1000,
                    label: 'more than 50MB'
                }
            ]
        },
        {
            id: 'buildSize',
            title: 'Build size',
            type: 'integer',
            show: false,
            filter: false,
            width: 80
        },
        {
            id: 'type',
            title: 'Source',
            type: 'string',
            show: true,
            width: 90,
            array: true,
            format: 'enum',
            elements: [
                { value: 'manual', label: 'Manual' },
                { value: 'cli', label: 'CLI' },
                { value: 'vcs', label: 'Git' }
            ]
        },
        {
            id: '$updatedAt',
            title: 'Updated',
            type: 'datetime',
            show: true,
            width: 150,
            format: 'datetime'
        }
    ]);

    let showMobileFilters = false;

    let range = SiteUsageRange.ThirtyDays;
    const rangeOptions = [
        { value: SiteUsageRange.TwentyFourHours, label: 'Last 24 hours' },
        { value: SiteUsageRange.ThirtyDays, label: 'Last 30 days' },
        { value: SiteUsageRange.NinetyDays, label: 'Last 90 days' }
    ];
    const now = new Date();
    let metrics = [
        {
            id: 'buildsTotal',
            value: null,
            description: 'Total build count'
        },
        {
            id: 'buildsStorageTotal',
            value: null,
            description: 'Total build size'
        },
        {
            id: 'buildsTimeTotal',
            value: null,
            description: 'Total build time'
        },
        {
            id: 'avgTime',
            value: null,
            description: 'Average build time'
        },
        {
            id: 'success',
            value: null,
            description: 'Successful deployment'
        },
        {
            id: 'failed',
            value: null,
            description: 'Failed deployment'
        }
    ];
    onMount(async () => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
        await fetchUsage();
    });

    async function fetchUsage() {
        metrics.forEach((metric) => {
            metric.value = null;
        });
        metrics = metrics;
        try {
            const usage = await sdk.forProject.sites.getSiteUsage($page.params.site, range);
            metrics = metrics.map((metric) => {
                metric.value = usage[metric.id];
                return metric;
            });
            metrics = metrics;
            console.log(usage);
        } catch (error) {
            console.log(error);
        }
    }

    function clearAll() {
        queries.clearAll();
        queries.apply();
    }

    $: console.log(metrics);
</script>

<Container>
    <Layout.Stack gap="xxl">
        <Layout.Stack gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                    Metrics for {range !== SiteUsageRange.TwentyFourHours
                        ? `${toLocaleDate(
                              new Date(
                                  now.getTime() -
                                      parseInt(range.split('d')[0]) * 24 * 60 * 60 * 1000
                              ).toString()
                          )} to`
                        : ''}
                    {toLocaleDate(now.toString())}
                </Typography.Text>
                <div>
                    <InputSelect
                        id="range"
                        bind:value={range}
                        options={rangeOptions}
                        on:change={fetchUsage} />
                </div>
            </Layout.Stack>
            <Layout.Stack direction="row">
                {#each metrics as metric}
                    <UsageCard description={metric.description} bind:value={metric.value} />
                {/each}
            </Layout.Stack>
        </Layout.Stack>
        <Layout.Stack gap="l">
            <Layout.Stack justifyContent="space-between" direction="row">
                <Layout.Stack alignItems="center" direction="row" gap="s">
                    <QuickFilters {columns} />
                    <Filters query={data.query} {columns} let:disabled let:toggle singleCondition>
                        <Layout.Stack alignItems="center" direction="row" gap="xs">
                            <Button
                                text
                                on:click={toggle}
                                {disabled}
                                size="s"
                                ariaLabel="open filter">
                                <span class="icon-filter-line" />
                                <span class="text">More filters</span>
                            </Button>
                            {#if $tags?.length}
                                <!-- TODO: add vertical divider to pink 2 -->
                                <div
                                    style="flex-basis:1px; background-color:hsl(var(--color-border)); width: 1px">
                                </div>
                                <Button text on:click={clearAll} size="s">Clear all</Button>
                            {/if}
                        </Layout.Stack>
                    </Filters>
                </Layout.Stack>
                <ViewSelector view={View.Table} {columns} hideView allowNoColumns hideText />
                <Button size="s" on:click={() => (showCreateDeployment = true)}
                    >Create deployment</Button>
            </Layout.Stack>
            <div class="is-only-mobile">
                <Layout.Stack justifyContent="space-between" direction="row">
                    <Button
                        text
                        size="s"
                        on:click={() => (showMobileFilters = !showMobileFilters)}
                        ariaLabel="toggle filters">
                        <span class="icon-filter-line" />
                        <span class="text">Filters</span>
                    </Button>

                    <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
                </Layout.Stack>
                <div
                    class:u-hide={!showMobileFilters}
                    class:u-flex={showMobileFilters}
                    class=" u-gap-8 u-flex-wrap u-margin-block-start-16">
                    <QuickFilters {columns} />

                    <Filters query={data.query} {columns} clearOnClick>
                        <svelte:fragment slot="mobile" let:disabled let:toggle>
                            <Pill
                                button
                                on:click={toggle}
                                {disabled}
                                class="u-flex u-gap-4 u-cross-center"
                                style="--p-tag-content-height: auto">
                                <span class="text">More filters</span>
                                <span class="icon-cheveron-down" />
                            </Pill>
                        </svelte:fragment>
                    </Filters>
                </div>
            </div>
            {#if $deploymentList.total}
                <Table columns={$columns} {data} />

                <PaginationWithLimit
                    name="Deployments"
                    limit={data.limit}
                    offset={data.offset}
                    total={$deploymentList?.total} />
            {:else if data?.query}
                <EmptyFilter resource="deployments" />
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Container>
{#if selectedDeployment}
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}

{#if showCreateDeployment}
    <CreateGitDeploymentModal bind:show={showCreateDeployment} />
{/if}
