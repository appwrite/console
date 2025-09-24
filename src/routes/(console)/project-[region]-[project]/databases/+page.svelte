<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';

    import type { PageData } from './$types';
    import Create from './create.svelte';
    import Grid from './grid.svelte';
    import { columns } from './store';
    import Table from './table.svelte';
    import { registerCommands } from '$lib/commandCenter';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import EmptySearch from '$lib/components/emptySearch.svelte';

    export let data: PageData;

    let showCreate = false;
    const project = page.params.project;

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(
            `${base}/project-${page.params.region}-${project}/databases/database-${event.detail.$id}`
        );
    }

    $: $registerCommands([
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
                href={`${base}/project-${page.params.region}-${page.params.project}/databases`}
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
