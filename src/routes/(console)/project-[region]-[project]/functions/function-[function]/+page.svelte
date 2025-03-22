<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        Empty,
        Heading,
        PaginationWithLimit,
        Alert,
        ViewSelector,
        EmptySearch
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { deploymentList, func } from './store';
    import { Container, ContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import Create from './create.svelte';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { readOnly } from '$lib/stores/billing';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import Table from './table.svelte';
    import { Filters } from '$lib/components/filters';
    import { queries, tags } from '$lib/components/filters/store';
    import { View } from '$lib/helpers/load';
    import DeploymentCard from './deploymentCard.svelte';
    import RedeployModal from './redeployModal.svelte';
    import QuickFilters from './quickFilters.svelte';
    import { Pill } from '$lib/elements';
    import { onMount } from 'svelte';
    import { canWriteFunctions } from '$lib/stores/roles';

    export let data;

    let showRedeploy = false;
    let showAlert = true;

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
            id: '$createdAt',
            title: 'Created',
            type: 'datetime',
            show: true,
            width: 150,
            format: 'datetime'
        },
        {
            id: '$updatedAt',
            title: 'Updated',
            type: 'datetime',
            show: true,
            width: 150,
            format: 'datetime'
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
            title: 'Size',
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
        }
    ]);

    let showMobileFilters = false;

    onMount(() => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
    });

    function clearAll() {
        queries.clearAll();
        queries.apply();
    }
</script>

<Container>
    <ContainerHeader title="Deployments">
        <Create main />
    </ContainerHeader>
    {#if !data?.deploymentList?.total && !data?.query}
        <Empty single target="deployment">
            <div class="u-text-center">
                <Heading size="7" tag="h2">Create your first deployment to get started.</Heading>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    Learn more about deployments in our Documentation.
                </p>
            </div>
            <div class="u-flex u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/products/functions/deployment"
                    text
                    event="empty_documentation"
                    ariaLabel={`create deployment`}>Documentation</Button>
                <Create secondary />
            </div>
        </Empty>
    {:else}
        {@const activeDeployment = data.activeDeployment}

        <div class="common-section">
            <Heading tag="h3" size="7">Active</Heading>
        </div>
        {#if data?.activeDeployment && !$func.live && showAlert}
            <Alert
                type="warning"
                class="u-margin-block-start-8"
                isStandalone
                dismissible
                on:dismiss={() => (showAlert = false)}>
                Some configuration options are not live yet. Redeploy your function to apply latest
                changes.
            </Alert>
        {/if}
        {#if activeDeployment}
            <DeploymentCard deployment={activeDeployment}>
                <svelte:fragment slot="actions">
                    <div class="u-flex u-flex-wrap">
                        <Button
                            text
                            href={`${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${$page.params.function}/deployment-${activeDeployment.$id}`}>
                            Build logs
                        </Button>
                        {#if $canWriteFunctions}
                            <Button
                                text
                                class="u-margin-inline-end-16"
                                on:click={() => {
                                    selectedDeployment = activeDeployment;
                                    showRedeploy = true;
                                }}>
                                Redeploy
                            </Button>
                        {/if}
                        <Button
                            secondary
                            href={`${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${$func.$id}/executions/execute-function`}
                            disabled={isCloud && $readOnly && !GRACE_PERIOD_OVERRIDE}>
                            Execute
                        </Button>
                    </div>
                </svelte:fragment>
            </DeploymentCard>
        {:else if !$deploymentList.total && !data?.query}
            <Empty single target="deployment">
                <div class="u-text-center">
                    <Heading size="7" tag="h2"
                        >Create your first deployment to get started.</Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        Learn more about deployments in our Documentation.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/functions/deployment"
                        text
                        event="empty_documentation"
                        ariaLabel={`create deployment`}>Documentation</Button>
                    <Create secondary />
                </div>
            </Empty>
        {:else}
            <Empty noMedia single>
                <Create secondary round>
                    <i class="icon-plus" />
                </Create>
                <div class="u-text-center">
                    <p class="body-text-2 u-margin-block-start-4">
                        Add a new deployment, or activate an existing one to see your function in
                        action. <br />Learn more about deployments in our
                        <a
                            class="link"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://appwrite.io/docs/products/functions/deployment"
                            >documentation</a
                        >.
                    </p>
                </div>
            </Empty>
        {/if}
        <div class="u-margin-block-start-48">
            <Heading tag="h3" size="7">All deployments</Heading>
            <div class="u-flex u-main-space-between is-not-mobile u-margin-block-start-16">
                <div class="u-flex u-gap-8 u-cross-center u-flex-wrap">
                    <QuickFilters {columns} />
                    <Filters query={data.query} {columns} let:disabled let:toggle singleCondition>
                        <div class="u-flex u-gap-4">
                            <Button
                                text
                                on:click={toggle}
                                {disabled}
                                ariaLabel="open filter"
                                noMargin={!$tags?.length}>
                                <span class="icon-filter-line" />
                                <span class="text">More filters</span>
                            </Button>
                            {#if $tags?.length}
                                <div
                                    style="flex-basis:1px; background-color:hsl(var(--color-border)); width: 1px">
                                </div>
                                <Button text on:click={clearAll}>Clear all</Button>
                            {/if}
                        </div>
                    </Filters>
                </div>
                <div class="u-flex u-gap-16">
                    <ViewSelector view={View.Table} {columns} hideView allowNoColumns hideText />
                </div>
            </div>
            <div class="is-only-mobile">
                <div class="u-flex u-main-space-between u-margin-block-start-16">
                    <Button
                        text
                        on:click={() => (showMobileFilters = !showMobileFilters)}
                        ariaLabel="toggle filters"
                        noMargin>
                        <span class="icon-filter-line" />
                        <span class="text">Filters</span>
                    </Button>

                    <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
                </div>
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
                                <!-- <span class="icon-filter-line" /> -->
                                <span class="text">More filters</span>
                                <span class="icon-cheveron-down" />
                            </Pill>
                        </svelte:fragment>
                    </Filters>
                </div>
            </div>
        </div>
        {#if $deploymentList.total}
            <Table columns={$columns} {data} />
        {:else if data?.query}
            <EmptySearch hidePages>
                <div class="common-section">
                    <div class="u-text-center common-section">
                        <b class="body-text-2 u-bold">Sorry we couldn't find any deployments</b>
                        <p>There are no deployments that match your filters.</p>
                    </div>
                    <div class="u-flex u-gap-16 common-section u-main-center">
                        <Button secondary on:click={clearAll}>Clear filters</Button>
                    </div>
                </div>
            </EmptySearch>
        {/if}
    {/if}

    <PaginationWithLimit
        name="Deployments"
        limit={data.limit}
        offset={data.offset}
        total={$deploymentList?.total} />
</Container>

{#if selectedDeployment}
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
