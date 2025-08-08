<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Activity } from '$lib/layout';
    import { rowActivitySheet } from './store';
    import { pageToOffset } from '$lib/helpers/load';
    import { type Models, Query } from '@appwrite.io/console';
    import { Layout, Skeleton, Table } from '@appwrite.io/pink-svelte';

    let limit = 25; /* default */
    let offset = $state(0);
    let loading = $state(true);
    let rowActivityLogs = $state<Models.LogList | null>(null);

    onMount(loadRowLogs);

    async function loadRowLogs(event?: CustomEvent<number>) {
        loading = true;

        if (event) {
            offset = pageToOffset(event.detail, limit);
        }

        const row = $rowActivitySheet.row;

        rowActivityLogs = await sdk
            .forProject(page.params.region, page.params.project)
            .grids.listRowLogs({
                databaseId: row.$databaseId,
                tableId: row.$tableId,
                rowId: row.$id,
                queries: [Query.limit(limit), Query.offset(offset)]
            });

        loading = false;
    }
</script>

{#if loading}
    <div style:margin-block="2.25rem" style:margin-inline-end="2.25rem">
        <Table.Root columns={5} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="user" {root}>User</Table.Header.Cell>
                <Table.Header.Cell column="event" {root}>Event</Table.Header.Cell>
                <Table.Header.Cell column="location" {root}>Location</Table.Header.Cell>
                <Table.Header.Cell column="ip" {root}>IP</Table.Header.Cell>
                <Table.Header.Cell column="date" {root}>Date</Table.Header.Cell>
            </svelte:fragment>

            {#each Array(5) as _}
                <Table.Row.Base {root}>
                    <Table.Cell column="user" {root}>
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <Skeleton variant="circle" width={64} height={64} />
                            <Skeleton variant="line" width={160} height={18} />
                        </Layout.Stack>
                    </Table.Cell>

                    <Table.Cell column="event" {root}>
                        <Skeleton variant="line" width={220} height={18} />
                    </Table.Cell>

                    <Table.Cell column="location" {root}>
                        <Skeleton variant="line" width={140} height={18} />
                    </Table.Cell>

                    <Table.Cell column="ip" {root}>
                        <Skeleton variant="line" width={120} height={18} />
                    </Table.Cell>

                    <Table.Cell column="date" {root}>
                        <Skeleton variant="line" width={160} height={18} />
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    </div>
{:else if rowActivityLogs}
    <Activity
        {limit}
        {offset}
        on:page={loadRowLogs}
        logs={rowActivityLogs}
        useCreateLinkForPagination={false} />
{/if}
