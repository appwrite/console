<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { EmptyFilter, PaginationWithLimit } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Table from './table.svelte';
    import { Card, Empty } from '@appwrite.io/pink-svelte';
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
    <ResponsiveContainerHeader hasFilters {columns} hideView analyticsSource="site_logs" />

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
