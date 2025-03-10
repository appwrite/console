<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Alert, Empty, EmptySearch, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { project } from '$routes/(console)/project-[project]/store';
    import { base } from '$app/paths';
    import { Filters, queries } from '$lib/components/filters';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';
    import QuickFilters from './quickFilters.svelte';
    import { tags } from '$lib/components/filters/store';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let data;

    const columns = writable<Column[]>([
        { id: '$id', title: 'Execution ID', type: 'string', show: true, width: 150 },
        {
            id: 'status',
            title: 'Status',
            type: 'enum',
            show: true,
            width: 130,
            array: true,
            format: 'enum',
            elements: ['completed', 'failed', 'waiting', 'scheduled', 'processing', 'cancelled']
        },
        {
            id: '$createdAt',
            title: 'Created',
            type: 'datetime',
            show: true,
            width: 120,
            format: 'datetime',
            elements: [
                {
                    value: 5 * 60 * 1000,
                    label: 'last 5 minutes'
                },
                {
                    value: 60 * 60 * 1000,
                    label: 'last 1 hour'
                },
                {
                    value: 24 * 60 * 60 * 1000,
                    label: 'last 24 hours'
                }
            ]
        },
        {
            id: 'trigger',
            title: 'Trigger',
            type: 'string',
            show: false,
            width: 90,
            array: true,
            format: 'enum',
            elements: [
                { value: 'http', label: 'HTTP' },
                { value: 'schedule', label: 'Schedule' },
                { value: 'event', label: 'Event' }
            ]
        },
        {
            id: 'requestMethod',
            title: 'Method',
            type: 'string',
            show: true,
            width: 70,
            array: true,
            format: 'enum',
            elements: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        },
        {
            id: 'responseStatusCode',
            title: 'Status code',
            type: 'integer',
            show: true,
            width: 100,
            format: 'integer',
            elements: [
                {
                    value: 299,
                    label: 'Success (200-299)'
                },
                {
                    value: 399,
                    label: 'Redirect (300-399)'
                },
                {
                    value: 499,
                    label: 'Client error (400-499)'
                },
                {
                    value: 599,
                    label: 'Server error (500-599)'
                }
            ]
        },
        {
            id: 'requestPath',
            title: 'Path',
            type: 'string',
            show: true,
            width: 90,
            format: 'string'
        },
        {
            id: 'duration',
            title: 'Duration',
            type: 'integer',
            show: true,
            width: 80,
            format: 'integer',
            elements: [
                {
                    value: 1,
                    label: 'more than 1 second'
                },
                {
                    value: 5,
                    label: 'more than 5 seconds'
                },
                {
                    value: 30,
                    label: 'more than 30 seconds'
                }
            ]
        }
    ]);

    let showMobileFilters = false;
    onMount(() => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });

    function clearAll() {
        queries.clearAll();
        queries.apply();
    }
</script>

<Container>
    <Layout.Stack direction="row" alignItems="center" justifyContent="space-between">
        <QuickFilters {columns} />
        <!-- <Filters
            query={data.query}
            {columns}
            let:disabled
            let:toggle
            clearOnClick
            analyticsSource="executions_filters">
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
                style="flex-basis: 1px; background-color: hsl(var(--border)); width: 1px;">
                </div>
                <Button text on:click={clearAll}>Clear All</Button>
                {/if}
                </div>
                </Filters> -->
        <Layout.Stack gap="s" inline direction="row" alignItems="center">
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
            <Button
                event="execute_function"
                href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
                disabled={!$func.$id || !$func?.deployment}>
                Execute
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if !$func.logging}
        <div class="common-section">
            <Alert type="info" isStandalone>
                <svelte:fragment slot="title">Your execution logs are disabled</svelte:fragment>
                To view execution logs and errors, enable them in your
                <a
                    href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/settings`}
                    class="link">
                    Function settings</a
                >.
            </Alert>
        </div>
    {/if}
    {#if data?.executions?.total}
        <Table columns={$columns} {data} />

        <PaginationWithLimit
            name="Executions"
            limit={data.limit}
            offset={data.offset}
            total={data.executions.total} />
    {:else if data?.query}
        <EmptySearch hidePages>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <b class="body-text-2 u-bold">Sorry we couldn't find any executions</b>
                    <p>There are no executions that match your filters.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button
                        secondary
                        on:click={() => {
                            queries.clearAll();
                            queries.apply();
                        }}>Clear filters</Button>
                </div>
            </div>
        </EmptySearch>
    {:else}
        <Empty
            single
            target="execution"
            href="https://appwrite.io/docs/products/functions/execution"
            on:click={() =>
                goto(
                    `${base}/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`
                )}>
        </Empty>
    {/if}
</Container>
