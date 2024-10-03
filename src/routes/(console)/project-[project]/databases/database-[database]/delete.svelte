<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { database } from './store';
    import {
        TableBody,
        TableCellHead,
        TableHeader,
        TableCell,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { type Models, Query } from '@appwrite.io/console';
    const databaseId = $page.params.database;

    export let showDelete = false;

    let error = null;
    let databaseName: string = null;
    let isLoadingDocumentsCount = false;

    /* enable overflow-x */
    const columnWidth = 135;

    $: collectionItems = [];
    let collections: Models.CollectionList = null;

    function buildQueries(): string[] {
        const queries = [Query.orderDesc('$updatedAt')];

        if (collectionItems.length > 0) {
            queries.push(Query.limit(25));
            queries.push(Query.offset(collectionItems.length));
        } else {
            queries.push(Query.limit(3));
        }

        return queries;
    }

    async function listCollections() {
        // let's just wait...
        if (isLoadingDocumentsCount) return;

        isLoadingDocumentsCount = true;

        try {
            const queries = buildQueries();

            collections = await sdk.forProject.databases.listCollections(databaseId, queries);

            const collectionPromises = collections.collections.map(async (collection) => {
                const { total: totalDocuments } = await sdk.forProject.databases.listDocuments(
                    databaseId,
                    collection.$id,
                    [Query.limit(1)] /* limit 1, just to get the total count */
                );

                return {
                    id: collection.$id,
                    name: collection.name,
                    count: totalDocuments,
                    updatedAt: collection.$updatedAt
                };
            });

            collectionItems = [...collectionItems, ...(await Promise.all(collectionPromises))];
        } catch (err) {
            error = true;
        } finally {
            isLoadingDocumentsCount = false;
        }
    }

    const handleDelete = async () => {
        try {
            await sdk.forProject.databases.delete(databaseId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$database.name} has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/databases`);
            trackEvent(Submit.DatabaseDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseDelete);
        }
    };

    /* reset data on modal close */
    $: if (!showDelete) {
        collections = null;
        databaseName = null;
        collectionItems = [];
    }
</script>

<div class="max-height-dialog">
    <Modal
        title="Delete database"
        icon="exclamation"
        size="big"
        state="warning"
        bind:show={showDelete}
        onSubmit={handleDelete}
        headerDivider={false}>
        {#await listCollections()}
            <div class="u-flex u-main-center">
                <div class="loader" />
            </div>
        {:then}
            {#if error}
                <p class="text" data-private>
                    Are you sure you want to delete <b>{$database.name}</b>?
                </p>
            {:else if collectionItems.length > 0}
                <p class="text" data-private>
                    The following collections and all data associated with <b>{$database.name}</b>
                    will be permanently deleted. This includes backups.
                    <b>This action is irreversible.</b>
                </p>

                <div class="u-flex-vertical u-gap-16">
                    <TableScroll dense noMargin class="table no-inner-borders">
                        <TableHeader>
                            <TableCellHead width={columnWidth}>Collection</TableCellHead>
                            <TableCellHead width={columnWidth}># of Documents</TableCellHead>
                            <TableCellHead width={columnWidth}>Last Updated</TableCellHead>
                        </TableHeader>
                        <TableBody>
                            {#each collectionItems as collection}
                                <TableRow>
                                    <TableCell width={columnWidth} title="Collection"
                                        >{collection.name}</TableCell>
                                    <TableCell width={columnWidth} title="Document Count"
                                        >{collection.count}</TableCell>
                                    <TableCell width={columnWidth} title="Last Updated"
                                        >{toLocaleDate(collection.updatedAt)}</TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </TableScroll>

                    {#if collectionItems.length < collections.total}
                        <div class="u-flex u-gap-16 u-cross-center">
                            <button class="u-underline" on:click={listCollections} type="button">
                                Show more
                            </button>

                            {#if isLoadingDocumentsCount}
                                <div class="loader is-small" />
                            {/if}
                        </div>
                    {:else}
                        <button
                            class="u-underline"
                            on:click={() => {
                                collectionItems = collectionItems.slice(0, 3);
                            }}
                            type="button">
                            Show less
                        </button>
                    {/if}
                </div>

                <FormList>
                    <InputText
                        label={`Confirm the database name to continue`}
                        placeholder="Enter {$database.name} to continue"
                        id="database-name"
                        required
                        bind:value={databaseName} />
                </FormList>
            {:else}
                <p class="text" data-private>
                    Are you sure you want to delete <b>{$database.name}</b>?
                </p>
            {/if}
        {/await}

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button
                secondary
                submit
                disabled={isLoadingDocumentsCount ||
                    (collections.total > 0 &&
                        !error &&
                        (!databaseName || databaseName !== $database.name))}>
                Delete
            </Button>
        </svelte:fragment>
    </Modal>
</div>

<style>
    :global(.max-height-dialog dialog) {
        max-height: 650px;
    }

    :global(.no-inner-borders .table) {
        box-shadow: unset;
        border-radius: unset;
    }
</style>
