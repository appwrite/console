<script lang="ts">
    import { page } from '$app/state';
    import {
        Empty,
        PaginationWithLimit,
        SearchQuery,
        ViewSelector,
        Id,
        CardContainer,
        GridItem1
    } from '$lib/components';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { columns } from './store';
    import { Icon, Layout, Table as PinkTable, Tooltip } from '@appwrite.io/pink-svelte';
    import Create from './create.svelte';
    import { goto } from '$app/navigation';
    import { IconPlus, IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import EmptySearch from '$lib/components/emptySearch.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { View } from '$lib/helpers/load';
    import { base } from '$app/paths';
    import { Button } from '$lib/elements/forms';

    let {
        databases,
        tables,
        policies,
        lastBackups,
        limit,
        offset,
        view,
        search,
        getDatabaseUrl
    }: {
        databases: { total: number; databases: Models.Database[] };
        tables: Record<string, string>;
        policies: Record<string, Array<{ schedule: string }>>;
        lastBackups: Record<string, string>;
        limit: number;
        offset: number;
        view: View;
        search: string | null;
        getDatabaseUrl: (database: Models.Database, firstTableId?: string | null) => string | null;
    } = $props();

    let showCreate = $state(false);

    const clearSearchHref = page.url.pathname;
    async function onCreated(e: CustomEvent<Models.Database>) {
        showCreate = false;
        const href = getDatabaseUrl(e.detail, null);
        if (href) await goto(href);
    }

    function getPolicyDescription(cron: string): string {
        const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(' ');
        if (dayOfMonth !== '*') return 'Monthly';
        if (dayOfWeek !== '*') return 'Weekly on Mondays';
        if (minute !== '*' && hour === '*') return 'Hourly';
        if (hour !== '*') return 'Daily';
        return '';
    }
</script>

<Layout.Stack direction="row" justifyContent="space-between">
    <Layout.Stack direction="row" alignItems="center">
        <SearchQuery placeholder="Search by name or ID" />
    </Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <ViewSelector {columns} {view} hideColumns={!databases.total} hideView={!databases.total} />
        {#if $canWriteDatabases}
            <Button event="create_database">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create database
            </Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>

{#if databases.total}
    {#if view === 'grid'}
        <CardContainer
            disableEmpty={!$canWriteDatabases}
            total={databases.total}
            {offset}
            event="database"
            service="databases"
            on:click={() => (showCreate = true)}>
            {#each databases.databases as database}
                {@const href = getDatabaseUrl(database, tables?.[database.$id] ?? null)}
                <GridItem1 {href}>
                    <svelte:fragment slot="title">{database.name}</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        {#if lastBackups && lastBackups[database.$id]}
                            Last backup: {lastBackups[database.$id]}
                        {:else if !policies || !policies[database.$id]}
                            <span class="icon-exclamation"></span> No backup policies
                        {:else}
                            Last backup: No backups yet
                        {/if}
                    </svelte:fragment>
                    <Id value={database.$id}>{database.$id}</Id>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty"><p>Create a database</p></svelte:fragment>
        </CardContainer>
    {:else}
        <PinkTable.Root columns={$columns} let:root>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title }}
                    <PinkTable.Header.Cell column={id} {root}>{title}</PinkTable.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each databases.databases as database (database.$id)}
                {@const tableId = tables?.[database.$id] ?? null}
                {@const href = getDatabaseUrl(database, tableId)}
                <PinkTable.Row.Link {root} {href}>
                    {#each $columns as column}
                        <PinkTable.Cell column={column.id} {root}>
                            {#if column.id === '$id'}
                                {#key $columns}
                                    <Id value={database.$id}>{database.$id}</Id>
                                {/key}
                            {:else if column.id === 'name'}
                                {database.name}
                            {:else if column.id === 'backup'}
                                {@const p = policies?.[database.$id] ?? null}
                                {@const last = lastBackups?.[database.$id] ?? null}
                                {@const description = p
                                    ?.map((policy) => getPolicyDescription(policy.schedule))
                                    .join(', ')}
                                <Tooltip
                                    placement="bottom"
                                    disabled={!p || !last}
                                    maxWidth="fit-content">
                                    <span class="u-trim">
                                        {#if !p}
                                            <Layout.Stack
                                                direction="row"
                                                gap="xxs"
                                                alignItems="center">
                                                <Icon
                                                    icon={IconExclamation}
                                                    size="s"
                                                    color="--bgcolor-warning" />
                                                No backup policies
                                            </Layout.Stack>
                                        {:else}
                                            {description}
                                        {/if}
                                    </span>
                                    <span slot="tooltip">Last backup: {last}</span>
                                </Tooltip>
                            {:else}
                                {toLocaleDateTime(database[column.id])}
                            {/if}
                        </PinkTable.Cell>
                    {/each}
                </PinkTable.Row.Link>
            {/each}
        </PinkTable.Root>
    {/if}

    <PaginationWithLimit name="Databases" {limit} {offset} total={databases.total} />
{:else if search}
    <EmptySearch target="databases" hidePagination>
        <Button
            href={clearSearchHref ??
                `${base}/project-${page.params.region}-${page.params.project}/databases`}
            size="s"
            secondary>Clear Search</Button>
    </EmptySearch>
{:else}
    <Empty
        single
        href="https://appwrite.io/docs/products/databases/databases"
        target="database"
        allowCreate={$canWriteDatabases} />
{/if}

<Create bind:showCreate on:created={onCreated} />

<style>
    .icon-exclamation {
        color: hsl(var(--color-warning-100)) !important;
    }
</style>
