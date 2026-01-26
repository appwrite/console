<script lang="ts">
    import { EmptySearch, PaginationWithLimit, SearchQuery, ViewSelector } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { showCreateEntity, tableViewColumns } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageProps } from './$types';
    import { Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { app } from '$lib/stores/app';
    import { canWriteTables } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';
    import { resolveRoute } from '$lib/stores/navigation';
    import { getTerminologies } from '$database/(entity)';
    import { withPath } from '$lib/stores/navigation.js';

    const { data }: PageProps = $props();

    const { terminology } = getTerminologies();
    const entityTitle = terminology.entity.title;
    const entityLower = terminology.entity.lower;

    /**
     * init update because `getContext`
     * doesn't work on typescript context!
     */
    tableViewColumns.update((columns) => {
        /* $id */
        columns[0].title = `${entityTitle.singular} ID`;
        return columns;
    });

    function getImageRoute(type: 'light' | 'dark'): string {
        return withPath(resolveRoute('/'), `/images/empty-database-${type}.svg`);
    }
</script>

<Container databasesMainScreen>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name or ID" />
        </Layout.Stack>

        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector
                ui="new"
                view={data.view}
                columns={tableViewColumns}
                hideColumns={!data.entities.total}
                hideView={!data.entities.total} />

            {#if $canWriteTables}
                <Button event="create_table" on:click={() => ($showCreateEntity = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create table
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    {#if data.entities.total}
        {#if data.view === 'grid'}
            <Grid {data} {terminology} bind:showCreate={$showCreateEntity} />
        {:else}
            <Table {data} {terminology} />
        {/if}

        <PaginationWithLimit
            limit={data.limit}
            offset={data.offset}
            total={data.entities.total}
            name={entityTitle.plural} />
    {:else if data.search}
        <EmptySearch target={entityLower.singular} hidePagination>
            <Button
                size="s"
                secondary
                href={resolveRoute(
                    '/(console)/project-[region]-[project]/databases/database-[database]',
                    page.params
                )}>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                src={getImageRoute($app.themeInUse)}
                title="Create your first {entityLower.singular}">
                <span slot="description">
                    Create, organize, and query structured data with {entityTitle.plural}.
                </span>

                <span slot="actions">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/databases/databases"
                        text
                        event="empty_documentation"
                        ariaLabel="create {entityLower.singular}">Documentation</Button>

                    {#if $canWriteTables}
                        <Button secondary on:click={() => ($showCreateEntity = true)}>
                            Create {entityLower.singular}
                        </Button>
                    {/if}
                </span>
            </Empty>
        </Card.Base>
    {/if}
</Container>
