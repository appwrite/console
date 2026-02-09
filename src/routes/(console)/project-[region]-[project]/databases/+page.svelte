<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';

    import Grid from './grid.svelte';
    import { columns } from './store';
    import Table from './table.svelte';
    import type { PageProps } from './$types';
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { registerCommands } from '$lib/commandCenter';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import EmptySearch from '$lib/components/emptySearch.svelte';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';

    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import EmptyDatabaseCloud from './empty.svelte';

    const { data }: PageProps = $props();

    const isLimited = $derived(isServiceLimited('databases', $organization, data.databases.total));

    async function goToCreateDatabaseWizard() {
        await goto(
            resolveRoute('/(console)/project-[region]-[project]/databases/create', page.params)
        );
    }

    $effect(() => {
        $registerCommands([
            {
                label: 'Create database',
                callback: () => {
                    goToCreateDatabaseWizard();
                },
                keys: ['c'],
                disabled: !$canWriteDatabases || isLimited,
                icon: IconPlus,
                group: 'databases',
                rank: 10
            }
        ]);
    });
</script>

<Container>
    {#if data.databases.total}
        {@render containerHeader()}

        {#if data.view === 'grid'}
            <Grid {data} onCreateDatabaseClick={goToCreateDatabaseWizard} />
        {:else}
            <Table
                entities={data.entities}
                policies={data.policies}
                databases={data.databases}
                lastBackups={data.lastBackups} />
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
        <EmptyDatabaseCloud
            disabled={$canWriteDatabases}
            onDatabaseTypeSelected={async (type) => {
                await goto(
                    withPath(
                        resolveRoute(
                            '/(console)/project-[region]-[project]/databases/create',
                            page.params
                        ),
                        `?type=${type}`
                    )
                );
            }} />
    {/if}
</Container>

{#snippet containerHeader()}
    <ResponsiveContainerHeader
        hasSearch
        {columns}
        bind:view={data.view}
        searchPlaceholder="Search by name or ID">
        {#if $canWriteDatabases}
            <Tooltip disabled={!isLimited}>
                <div>
                    <Button
                        disabled={isLimited}
                        event="create_database"
                        on:click={goToCreateDatabaseWizard}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Create database
                    </Button>
                </div>
                <svelte:fragment slot="tooltip">
                    You have reached the maximum number of databases for your plan.
                </svelte:fragment>
            </Tooltip>
        {/if}
    </ResponsiveContainerHeader>
{/snippet}
