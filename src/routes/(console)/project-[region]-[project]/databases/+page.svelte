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
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { registerCommands } from '$lib/commandCenter';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import EmptySearch from '$lib/components/emptySearch.svelte';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import {
        BODY_TOOLTIP_MAX_WIDTH,
        BODY_TOOLTIP_WRAPPER_STYLE_PRELINE
    } from '$lib/helpers/tooltipContent';

    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import EmptyDatabaseCloud from './empty.svelte';
    import { flags } from '$lib/flags';
    import { user } from '$lib/stores/user';
    import { project } from '../store';

    const { data }: PageProps = $props();

    let showCreate = $state(false);

    const isMultiDb = $derived(flags.multiDb({ account: $user, organization: $organization }));
    const isLimited = $derived(isServiceLimited('databases', $organization, data.databases.total));

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(
            resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', {
                ...page.params,
                database: event.detail.$id
            })
        );
    }

    async function goToCreateDatabaseWizard() {
        await goto(
            resolveRoute('/(console)/project-[region]-[project]/databases/create', page.params)
        );
    }

    function triggerCreate() {
        if (isMultiDb) {
            goToCreateDatabaseWizard();
        } else {
            showCreate = true;
        }
    }

    $effect(() => {
        $registerCommands([
            {
                label: 'Create database',
                callback: () => {
                    triggerCreate();
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
    {@render containerHeader()}

    {#if data.databases.total}
        {#if data.view === 'grid'}
            <Grid {data} onCreateDatabaseClick={triggerCreate} />
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
    {:else if isMultiDb}
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
    {:else}
        <Empty
            single
            target="database"
            allowCreate={$canWriteDatabases}
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate project={$project} on:created={handleCreate} />

{#snippet containerHeader()}
    <ResponsiveContainerHeader
        hasSearch
        {columns}
        view={data.view}
        searchPlaceholder="Search by name or ID">
        {#if $canWriteDatabases}
            <Tooltip disabled={!isLimited} maxWidth={BODY_TOOLTIP_MAX_WIDTH}>
                <div>
                    <Button disabled={isLimited} event="create_database" on:click={triggerCreate}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Create database
                    </Button>
                </div>
                <svelte:fragment slot="tooltip">
                    <div style={BODY_TOOLTIP_WRAPPER_STYLE_PRELINE}>
                        You have reached the maximum number of databases for your plan.
                    </div>
                </svelte:fragment>
            </Tooltip>
        {/if}
    </ResponsiveContainerHeader>
{/snippet}
