<script lang="ts">
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import type { Models } from '@appwrite.io/console';
    import { resolveRoute } from '$lib/stores/navigation';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { Badge, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { getDatabaseTypeTitle } from '$routes/(console)/project-[region]-[project]/databases/store';

    let {
        data,
        onCreateDatabaseClick
    }: {
        data: PageData;
        onCreateDatabaseClick: () => Promise<void> | void;
    } = $props();

    function getDatabaseRoute(database: Models.Database) {
        return resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', {
            ...page.params,
            database: database.$id
        });
    }
</script>

<CardContainer
    total={data.databases.total}
    disableEmpty={!$canWriteDatabases}
    on:click={onCreateDatabaseClick}
    event="database"
    service="databases">
    {#each data.databases.databases as database}
        <GridItem1 href={getDatabaseRoute(database)}>
            <svelte:fragment slot="title">
                <Layout.Stack inline direction="row" gap="s" alignItems="center">
                    {database.name}

                    <Badge size="xs" variant="secondary" content={getDatabaseTypeTitle(database)} />
                </Layout.Stack>
            </svelte:fragment>

            <svelte:fragment slot="subtitle">
                {#if data.lastBackups && data.lastBackups[database.$id]}
                    Last backup: {data.lastBackups[database.$id]}
                {:else if !data.policies || !data.policies[database.$id]}
                    <Layout.Stack inline direction="row" gap="s" alignItems="center">
                        <Icon icon={IconExclamation} size="s" color="--bgcolor-warning" />
                        No backup policies
                    </Layout.Stack>
                {:else}
                    Last backup: No backups yet
                {/if}
            </svelte:fragment>

            <Id value={database.$id}>{database.$id}</Id>
        </GridItem1>
    {/each}

    <svelte:fragment slot="empty">
        <p>Create a database</p>
    </svelte:fragment>
</CardContainer>
