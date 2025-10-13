<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';

    import Create from './create.svelte';
    import Grid from './grid.svelte';
    import { columns } from './store';
    import Table from './table.svelte';
    import type { PageProps } from './$types';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { registerCommands } from '$lib/commandCenter';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import EmptySearch from '$lib/components/emptySearch.svelte';

    import { resolveRoute } from '$lib/stores/navigation';

    const { data }: PageProps = $props();

    let showCreate = $state(false);

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(
            resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', {
                ...page.params,
                database: event.detail.$id
            })
        );
    }

    $effect(() => {
        $registerCommands([
            {
                label: 'Create database',
                callback: () => {
                    showCreate = true;
                },
                keys: ['c'],
                disabled: showCreate || !$canWriteDatabases,
                icon: IconPlus,
                group: 'databases',
                rank: 10
            }
        ]);
    });
</script>

<Container>
    <ResponsiveContainerHeader
        hasSearch
        {columns}
        bind:view={data.view}
        searchPlaceholder="Search by name or ID">
        {#if $canWriteDatabases}
            <Button event="create_database" on:click={() => (showCreate = true)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create database
            </Button>
        {/if}
    </ResponsiveContainerHeader>

    {#if data.databases.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Databases"
            limit={data.limit}
            offset={data.offset}
            total={data.databases.total} />
    {:else if data.search}
        <EmptySearch target="databases" hidePagination>
            <Button
                href={resolveRoute('/(console)/project-[region]-[project]/databases', page.params)}
                size="s"
                secondary>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/databases/databases"
            target="database"
            allowCreate={$canWriteDatabases}
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
