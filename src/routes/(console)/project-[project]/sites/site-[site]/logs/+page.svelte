<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { EmptySearch, PaginationWithLimit, SearchQuery, ViewSelector } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    // import { getServiceLimit } from '$lib/stores/billing';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import Table from './table.svelte';
    import { queries } from '$lib/components/filters';
    import { Card, Empty, Layout } from '@appwrite.io/pink-svelte';
    import { View } from '$lib/helpers/load';

    export let data;

    // const logs = getServiceLimit('logs');

    const columns = writable<Column[]>([
        { id: '$id', title: 'Log ID', type: 'string', show: true, width: 150 },
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
            id: 'requestPath',
            title: 'Path',
            type: 'string',
            show: true,
            width: 90,
            format: 'string'
        }
    ]);
    let search = '';

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('sites.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery search={data.search} placeholder="Search by ID" disabled={!data.logs.total} />
        {#if data.logs.total}
            <ViewSelector view={View.Table} {columns} hideView />
        {/if}
    </Layout.Stack>

    {#if data?.logs?.total}
        <Table columns={$columns} logs={data.logs} />

        <PaginationWithLimit
            name="Logs"
            limit={data.limit}
            offset={data.offset}
            total={data.logs.total} />
    {:else if data?.query}
        <EmptySearch hidePages bind:search>
            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        queries.clearAll();
                        queries.apply();
                    }}>Clear filters</Button>
            </svelte:fragment>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                type="secondary"
                title="There are no logs to display at the moment"
                description="Logs are automatically generated based on your site's activity.">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="#"
                        secondary
                        event="empty_documentation"
                        size="s"
                        ariaLabel="logs">Documentation</Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
