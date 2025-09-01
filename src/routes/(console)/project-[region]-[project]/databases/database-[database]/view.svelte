<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { EmptySearch, PaginationWithLimit, SearchQuery, ViewSelector, Id, CardContainer, GridItem1 } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { showCreate, tableViewColumns } from './store';
    import { Card, Empty, Icon, Layout, Table as PinkTable } from '@appwrite.io/pink-svelte';
    import { canWriteTables } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';

    export let tables: { total: number; tables: Models.Table[] };
    export let limit: number;
    export let offset: number;
    export let view: 'grid' | 'table';
    export let search: string | null;

    const databaseId = page.params.database;
</script>

<Container paddingInlineEnd={false}>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name or ID" />
        </Layout.Stack>

        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector view={view} columns={tableViewColumns} hideColumns={!tables.total} hideView={!tables.total} />

            {#if $canWriteTables}
                <Button event="create_table" on:click={() => ($showCreate = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create table
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    {#if tables.total}
        {#if view === 'grid'}
            <CardContainer disableEmpty={!$canWriteTables} total={tables.total} {offset} event="table" service="tables" on:click={() => ($showCreate = true)}>
                {#each tables.tables as table}
                    <GridItem1 href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${table.$id}`}>
                        <svelte:fragment slot="title">{table.name}</svelte:fragment>
                        <Id value={table.$id}>{table.$id}</Id>
                    </GridItem1>
                {/each}
            </CardContainer>
        {:else}
            <PinkTable.Root columns={$tableViewColumns} let:root>
                <svelte:fragment slot="header" let:root>
                    {#each $tableViewColumns as { id, title }}
                        <PinkTable.Header.Cell column={id} {root}>{title}</PinkTable.Header.Cell>
                    {/each}
                </svelte:fragment>
                {#each tables.tables as table (table.$id)}
                    <PinkTable.Row.Link {root} href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${table.$id}`}>
                        {#each $tableViewColumns as column}
                            <PinkTable.Cell column={column.id} {root}>
                                {#if column.id === '$id'}
                                    {#key $tableViewColumns}
                                        <Id value={table.$id}>{table.$id}</Id>
                                    {/key}
                                {:else if column.id === 'name'}
                                    {table.name}
                                {:else}
                                    {table[column.id]}
                                {/if}
                            </PinkTable.Cell>
                        {/each}
                    </PinkTable.Row.Link>
                {/each}
            </PinkTable.Root>
        {/if}

        <PaginationWithLimit name="Tables" {limit} {offset} total={tables.total} />
    {:else if search}
        <EmptySearch target="tables" hidePagination>
            <Button size="s" secondary href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}`}>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty title="Create your first table" src={$app.themeInUse === 'dark' ? `${base}/images/empty-database-dark.svg` : `${base}/images/empty-database-light.svg`}>
                <span slot="description">Create, organize, and query structured data with Tables.</span>
                <span slot="actions">
                    <Button external href="https://appwrite.io/docs/products/databases/databases" text event="empty_documentation" ariaLabel={`create table`}>Documentation</Button>
                    {#if $canWriteTables}
                        <Button secondary on:click={() => { $showCreate = true; }}>Create table</Button>
                    {/if}
                </span>
            </Empty>
        </Card.Base>
    {/if}
</Container>
