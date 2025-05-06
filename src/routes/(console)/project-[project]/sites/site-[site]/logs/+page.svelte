<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { EmptyFilter, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Table from './table.svelte';
    import { ParsedTagList, QuickFilters } from '$lib/components/filters';
    import { Card, Empty, Layout } from '@appwrite.io/pink-svelte';
    import { View } from '$lib/helpers/load';
    import { columns } from './store';

    export let data;

    // const logs = getServiceLimit('logs');

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('sites.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
</script>

<Container>
    <Layout.Stack>
        <Layout.Stack direction="row" justifyContent="space-between">
            <QuickFilters {columns} analyticsSource="site_logs" />
            {#if data.logs.total}
                <ViewSelector view={View.Table} {columns} hideView />
            {/if}
        </Layout.Stack>

        <ParsedTagList />
    </Layout.Stack>
    {#if data?.logs?.total}
        <Table columns={$columns} logs={data.logs} />

        <PaginationWithLimit
            name="Logs"
            limit={data.limit}
            offset={data.offset}
            total={data.logs.total} />
    {:else if data?.query}
        <EmptyFilter resource="logs"></EmptyFilter>
    {:else}
        <Card.Base padding="none">
            <Empty
                type="secondary"
                title="There are no logs to display at the moment"
                description="Logs are automatically generated based on your site's activity.">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/sites/logs"
                        secondary
                        event="empty_documentation"
                        size="s"
                        ariaLabel="logs">Documentation</Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
