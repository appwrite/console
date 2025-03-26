<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Empty, EmptyFilter, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '$routes/(console)/project-[project]/store';
    import { base } from '$app/paths';
    import { View } from '$lib/helpers/load';
    import { Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import Table from './table.svelte';
    import { columns } from './store';
    import { ParsedTagList, QuickFilters } from '$lib/components/filters';

    export let data;

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
</script>

<Container>
    <Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="space-between">
            <QuickFilters {columns} analyticsSource="function_executions" />

            <Layout.Stack gap="s" inline direction="row" alignItems="center">
                {#if data?.executions?.total}
                    <ViewSelector view={View.Table} {columns} hideView />
                {/if}
                <Tooltip disabled={!!data.func?.deploymentId}>
                    <div>
                        <Button
                            event="execute_function"
                            href={`${base}/project-${$project.$id}/functions/function-${data.func.$id}/executions/execute-function`}
                            disabled={!data.func.$id || !data.func?.deploymentId}>
                            <Icon icon={IconPlus} size="s" slot="start" />
                            Create execution
                        </Button>
                    </div>
                    <span slot="tooltip">
                        Execution cannot be created because there is no active deployment.
                    </span>
                </Tooltip>
            </Layout.Stack>
        </Layout.Stack>
        <ParsedTagList />
    </Layout.Stack>

    {#if data?.executions?.total}
        <Table columns={$columns} logs={data.executions} />

        <PaginationWithLimit
            name="Executions"
            limit={data.limit}
            offset={data.offset}
            total={data.executions.total} />
    {:else if data?.query}
        <EmptyFilter resource="executions"></EmptyFilter>
    {:else}
        <Empty single target="execution">
            <svelte:fragment slot="actions">
                <Button
                    external
                    href="https://appwrite.io/docs/products/functions/execution"
                    text
                    event="empty_documentation"
                    size="s"
                    ariaLabel="create execution">Documentation</Button>
                <Tooltip disabled={!!data.func?.deploymentId}>
                    <div>
                        <Button
                            secondary
                            event="execute_function"
                            href={`${base}/project-${$project.$id}/functions/function-${data.func.$id}/executions/execute-function`}
                            disabled={!data.func.$id || !data.func?.deploymentId}>
                            Create execution
                        </Button>
                    </div>
                    <span slot="tooltip">
                        Execution cannot be created because there is no active deployment.
                    </span>
                </Tooltip>
            </svelte:fragment>
        </Empty>
    {/if}
</Container>
