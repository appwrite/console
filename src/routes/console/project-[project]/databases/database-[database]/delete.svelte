<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { database, collections } from './store';
    import {
        TableBody,
        TableCellHead,
        TableHeader,
        TableCell,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Query } from '@appwrite.io/console';
    const databaseId = $page.params.database;

    export let showDelete = false;

    let error = null;
    let databaseName: string = null;
    let isLoadingDocumentsCount = false;

    async function listCollections() {
        isLoadingDocumentsCount = true;

        try {
            /* can we improve this? */
            const collectionPromises = $collections.collections.map(async (collection) => {
                const { total: totalDocuments } = await sdk.forProject.databases.listDocuments(
                    databaseId, collection.$id,
                    [
                        Query.limit(1)
                    ]
                );

                return {
                    id: collection.$id,
                    name: collection.name,
                    count: totalDocuments,
                    updatedAt: collection.$updatedAt
                };
            });

            return await Promise.all(collectionPromises);
        } catch {
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
            await goto(`${base}/console/project-${$page.params.project}/databases`);
            trackEvent(Submit.DatabaseDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseDelete);
        }
    };
</script>

<Modal
    title="Delete database"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}>
    {#await listCollections()}
        <div class="u-flex u-main-center">
            <div class="loader" />
        </div>
    {:then collections}
        {#if error}
            <p class="text" data-private>
                Are you sure you want to delete <b>{$database.name}</b>?
            </p>
        {:else if collections.length > 0}
            <p class="text" data-private>
                The following collections and all data associated with <b>{$database.name}</b> will
                be permanently deleted.
                <b>This action is irreversible.</b>
            </p>

            <TableScroll dense noMargin isSticky class="table limited-modal-height">
                <TableHeader>
                    <TableCellHead>Collection</TableCellHead>
                    <TableCellHead># of Documents</TableCellHead>
                    <TableCellHead>Last Updated</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each collections as collection}
                        <TableRow>
                            <TableCell title="Collection">{collection.name}</TableCell>
                            <TableCell title="Documents">{collection.count}</TableCell>
                            <TableCell>{toLocaleDateTime(collection.updatedAt)}</TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </TableScroll>

            <FormList class="u-padding-block-start-24">
                <InputText
                    label={`Confirm the database name to continue`}
                    placeholder="Enter {$database.name} to continue"
                    id="database-name"
                    autofocus
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
            disabled={
            isLoadingDocumentsCount ||
            ($collections.total > 0 && !error && (!databaseName || databaseName !== $database.name))
        }>
            Delete
        </Button>
    </svelte:fragment>
</Modal>

<style>
    :global(.limited-modal-height .table-wrapper) {
        max-height: 450px; /* tentative, 650px [in design] looks too big and requires a scroll */
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    :global(.limited-modal-height .table-wrapper)::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 1024px) {
        :global(.limited-modal-height .table-wrapper) {
            max-height: 275px;
        }
    }
</style>
