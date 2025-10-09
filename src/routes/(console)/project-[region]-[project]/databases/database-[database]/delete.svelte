<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Query } from '@appwrite.io/console';
    import { Spinner, Table } from '@appwrite.io/pink-svelte';
    import { resolveRoute } from '$lib/stores/navigation';
    import { type EntityList, getTerminologies, toSupportiveEntity } from '$database/(entity)';

    let {
        showDelete = $bindable(false)
    }: {
        showDelete: boolean;
    } = $props();

    let error = $state(null);
    let confirmedDeletion = $state(false);
    let isLoadingRowsCount = $state(false);

    let entityItems = $state([]);
    let entities: EntityList | null = $state(null);

    const { terminology } = getTerminologies();
    const database = $derived(page.data.database);

    const projectSdk = $derived(sdk.forProject(page.params.region, page.params.project));

    function buildQueries(): string[] {
        const queries = [Query.orderDesc('$updatedAt')];

        if (entityItems.length > 0) {
            queries.push(Query.limit(25));
            queries.push(Query.offset(entityItems.length));
        } else {
            queries.push(Query.limit(3));
        }

        return queries;
    }

    async function listTables() {
        // let's just wait...
        if (isLoadingRowsCount) return;

        isLoadingRowsCount = true;

        try {
            const queries = buildQueries();
            const params = { databaseId: page.params.database, queries };

            switch (terminology.type) {
                case 'tablesdb': {
                    const { total, tables } = await projectSdk.tablesDB.listTables(params);
                    entities = { total, entities: tables.map(toSupportiveEntity) };
                    break;
                }
                case 'documentsdb': {
                    const { total, collections } =
                        await projectSdk.documentsDB.listCollections(params);
                    entities = { total, entities: collections.map(toSupportiveEntity) };
                    break;
                }
            }

            const entityPromises = entities.entities.map(async (entity) => {
                return {
                    id: entity.$id,
                    name: entity.name,
                    updatedAt: entity.$updatedAt
                };
            });

            entityItems = [...entityItems, ...(await Promise.all(entityPromises))];
        } catch (err) {
            error = true;
        } finally {
            isLoadingRowsCount = false;
        }
    }

    const handleDelete = async () => {
        try {
            const params = { databaseId: page.params.database };

            switch (terminology.type) {
                case 'tablesdb':
                    await projectSdk.tablesDB.delete(params);
                    break;

                case 'documentsdb':
                    await projectSdk.documentsDB.delete(params);
                    break;
            }

            showDelete = false;

            addNotification({
                type: 'success',
                message: `${database.name} has been deleted`
            });

            trackEvent(Submit.DatabaseDelete);

            await goto(
                resolveRoute('/(console)/project-[region]-[project]/databases', page.params)
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseDelete);
        }
    };

    /* reset data on modal close */
    $effect(() => {
        if (!showDelete) {
            entities = null;
            entityItems = [];

            error = false;
            confirmedDeletion = false;
        }
    });

    $effect(() => {
        if (showDelete) {
            listTables();
        }
    });
</script>

<Modal title="Delete database" bind:show={showDelete} onSubmit={handleDelete}>
    <p class="text" slot="description">
        {#if entityItems.length > 0}
            The following tables and all data associated with <b>{database.name}</b>, will be
            permanently deleted.
        {:else}
            Are you sure you want to delete <b>{database.name}</b>?
        {/if}
    </p>

    {#if isLoadingRowsCount}
        <div class="u-flex u-main-center">
            <Spinner />
        </div>
    {:else if error}
        <p class="text">
            Are you sure you want to delete <b>{database.name}</b>?
        </p>
    {:else if entityItems.length > 0}
        <div class="u-flex-vertical u-gap-16">
            <Table.Root columns={2} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell {root}>Table</Table.Header.Cell>
                    <Table.Header.Cell {root}>Last Updated</Table.Header.Cell>
                </svelte:fragment>
                {#each entityItems as table}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>{table.name}</Table.Cell>
                        <Table.Cell {root}>
                            <DualTimeView time={table.updatedAt} />
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>

            {#if entityItems.length < entities.total}
                <div class="u-flex u-gap-16 u-cross-center">
                    <button class="u-underline" onclick={listTables} type="button">
                        Show more
                    </button>

                    {#if isLoadingRowsCount}
                        <div class="loader is-small"></div>
                    {/if}
                </div>
            {:else if entityItems.length > 25}
                <button
                    class="u-underline"
                    onclick={() => {
                        entityItems = entityItems.slice(0, 3);
                    }}
                    type="button">
                    Show less
                </button>
            {/if}
        </div>
    {/if}

    {#if !isLoadingRowsCount}
        <p class="text" data-private>
            <b>
                Once deleted, this database and its backups cannot be restored. This action is
                irreversible.
            </b>
        </p>

        <div class="input-check-box-friction">
            <InputCheckbox
                required
                id="delete_database"
                bind:checked={confirmedDeletion}
                label="I understand and confirm" />
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button danger submit disabled={!confirmedDeletion}>Delete</Button>
    </svelte:fragment>
</Modal>
