<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';

    import type { PageData } from './$types';
    import Create from './create.svelte';
    import Grid from './grid.svelte';
    import { columns } from './store';
    import Table from './table.svelte';
    import { registerCommands } from '$lib/commandCenter';
    import { tooltip } from '$lib/actions/tooltip';
    import { canWriteDatabases } from '$lib/stores/roles';

    export let data: PageData;

    let showCreate = false;
    let isCreationDisabled = false;
    const project = $page.params.project;

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
            icon: 'plus',
            group: 'databases',
            rank: 10
        }
    ]);
</script>

<Container>
    <ContainerHeader
        title="Databases"
        total={data?.databases?.total}
        on:data={(data) => {
            isCreationDisabled = data.detail.isButtonDisabled;
        }}>
        <svelte:fragment>
            <div class="u-flex u-gap-16 u-cross-center u-flex-wrap">
                <ViewSelector
                    {columns}
                    view={data.view}
                    hideColumns={!data.databases.total}
                    hideView={!data.databases.total} />
                {#if $canWriteDatabases}
                    <div
                        use:tooltip={{
                            content: `Upgrade to add more databases`,
                            disabled: !isCreationDisabled
                        }}>
                        <Button
                            on:click={() => (showCreate = true)}
                            event="create_database"
                            disabled={isCreationDisabled}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text">Create database</span>
                        </Button>
                    </div>
                {/if}
            </div>
        </svelte:fragment>
    </ContainerHeader>

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
