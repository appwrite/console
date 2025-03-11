<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Alert, Empty, EmptyFilter, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '$routes/(console)/project-[project]/store';
    import { base } from '$app/paths';
    import { View } from '$lib/helpers/load';
    import QuickFilters from './quickFilters.svelte';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import Table from './table.svelte';
    import { columns } from './store';

    export let data;

    let showMobileFilters = false;
    onMount(() => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
</script>

<Container>
    <Layout.Stack direction="row" alignItems="center" justifyContent="space-between">
        <QuickFilters {columns} />

        <Layout.Stack gap="s" inline direction="row" alignItems="center">
            {#if data?.executions?.total}
                <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
            {/if}
            <Button
                event="execute_function"
                href={`${base}/project-${$project.$id}/functions/function-${data.func.$id}/executions/execute-function`}
                disabled={!data.func.$id || !data.func?.deployment}>
                <Icon icon={IconPlus} size="s" slot="start" />
                Create execution
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if !data.func.logging}
        <div class="common-section">
            <Alert type="info" isStandalone>
                <svelte:fragment slot="title">Your execution logs are disabled</svelte:fragment>
                To view execution logs and errors, enable them in your
                <a
                    href={`${base}/project-${$project.$id}/functions/function-${data.func.$id}/settings`}
                    class="link">
                    Function settings</a
                >.
            </Alert>
        </div>
    {/if}
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
        <Empty
            single
            target="execution"
            href="https://appwrite.io/docs/products/functions/execution"
            on:click={() =>
                goto(
                    `${base}/project-${$project.$id}/functions/function-${data.func.$id}/executions/execute-function`
                )}>
        </Empty>
    {/if}
</Container>
