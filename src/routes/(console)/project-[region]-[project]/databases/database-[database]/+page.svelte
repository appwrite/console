<script lang="ts">
    import { EmptySearch, PaginationWithLimit, SearchQuery, ViewSelector } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { showCreate, tableViewColumns } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { canWriteTables } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';

    export let data: PageData;

    const databaseId = page.params.database;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name or ID" />
        </Layout.Stack>

        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector
                ui="new"
                view={data.view}
                columns={tableViewColumns}
                hideColumns={!data.tables.total}
                hideView={!data.tables.total} />

            {#if $canWriteTables}
                <Button event="create_table" on:click={() => ($showCreate = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create table
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    {#if data.tables.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreate} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Tables"
            limit={data.limit}
            offset={data.offset}
            total={data.tables.total} />
    {:else if data.search}
        <EmptySearch target="tables" hidePagination>
            <Button
                size="s"
                secondary
                href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}`}
                >Clear Search</Button>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                title="Create your first table"
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/empty-database-dark.svg`
                    : `${base}/images/empty-database-light.svg`}>
                <span slot="description">
                    Create, organize, and query structured data with Tables.
                </span>
                <span slot="actions">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/databases/databases"
                        text
                        event="empty_documentation"
                        ariaLabel={`create table`}>Documentation</Button>

                    {#if $canWriteTables}
                        <Button
                            secondary
                            on:click={() => {
                                $showCreate = true;
                            }}>
                            Create table
                        </Button>
                    {/if}
                </span>
            </Empty>
        </Card.Base>
    {/if}
</Container>
