<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Empty, PaginationWithLimit, SearchQuery, ViewSelector } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
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
    let isCreationDisabled = false;
    const project = page.params.project;

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(
            `${base}/project-${$page.params.region}-${project}/databases/database-${event.detail.$id}`
        );
    }

    $: $registerCommands([
        {
            label: 'Create database',
            callback: () => {
                showCreate = true;
            },
            keys: ['c'],
            disabled: showCreate || isCreationDisabled || !$canWriteDatabases,
            icon: IconPlus,
            group: 'databases',
            rank: 10
        }
    ]);
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name or ID" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector
                {columns}
                view={data.view}
                hideColumns={!data.databases.total}
                hideView={!data.databases.total} />
            {#if $canWriteDatabases}
                <Button
                    on:click={() => (showCreate = true)}
                    event="create_database"
                    disabled={isCreationDisabled}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create database
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

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
            <Button href={`${base}/project-${page.params.project}/databases`} size="s" secondary
                >Clear Search</Button>
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
