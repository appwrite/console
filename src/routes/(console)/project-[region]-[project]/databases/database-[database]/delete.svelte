<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { type Models, Query } from '@appwrite.io/console';
    import { Spinner, Table } from '@appwrite.io/pink-svelte';
    import { resolveRoute } from '$lib/stores/navigation';

    let {
        showDelete = $bindable(false)
    }: {
        showDelete: boolean;
    } = $props();

    let error = $state(null);
    let confirmedDeletion = $state(false);
    let isLoadingRowsCount = $state(false);

    let tableItems = $state([]);
    let tables: Models.TableList | null = $state(null);

    const database = $derived(page.data.database);

    function buildQueries(): string[] {
        const queries = [Query.orderDesc('$updatedAt')];

        if (tableItems.length > 0) {
            queries.push(Query.limit(25));
            queries.push(Query.offset(tableItems.length));
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

            tables = await sdk
                .forProject(page.params.region, page.params.project)
                .tablesDB.listTables({
                    databaseId: page.params.database,
                    queries
                });

            const tablePromises = tables.tables.map(async (table) => {
                return {
                    id: table.$id,
                    name: table.name,
                    updatedAt: table.$updatedAt
                };
            });

            tableItems = [...tableItems, ...(await Promise.all(tablePromises))];
        } catch (err) {
            error = true;
        } finally {
            isLoadingRowsCount = false;
        }
    }

    const handleDelete = async () => {
        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDB.delete({
                databaseId: page.params.database
            });
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
            tables = null;
            tableItems = [];
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
        {#if tableItems.length > 0}
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
    {:else if tableItems.length > 0}
        <div class="u-flex-vertical u-gap-16">
            <Table.Root columns={2} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell {root}>Table</Table.Header.Cell>
                    <Table.Header.Cell {root}>Last Updated</Table.Header.Cell>
                </svelte:fragment>
                {#each tableItems as table}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>{table.name}</Table.Cell>
                        <Table.Cell {root}>
                            <DualTimeView time={table.updatedAt} />
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>

            {#if tableItems.length < tables.total}
                <div class="u-flex u-gap-16 u-cross-center">
                    <button class="u-underline" onclick={listTables} type="button">
                        Show more
                    </button>

                    {#if isLoadingRowsCount}
                        <div class="loader is-small"></div>
                    {/if}
                </div>
            {:else if tableItems.length > 25}
                <button
                    class="u-underline"
                    onclick={() => {
                        tableItems = tableItems.slice(0, 3);
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
