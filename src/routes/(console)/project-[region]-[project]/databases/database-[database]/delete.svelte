<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { database } from './store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { type Models, Query } from '@appwrite.io/console';
    import { Spinner, Table } from '@appwrite.io/pink-svelte';

    const databaseId = page.params.database;

    export let showDelete = false;
    let confirmedDeletion = false;

    let error = null;
    let isLoadingDocumentsCount = false;

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

            collections = await sdk
                .forProject(page.params.region, page.params.project)
                .databases.listCollections(databaseId, queries);

            const collectionPromises = collections.collections.map(async (collection) => {
                return {
                    id: collection.$id,
                    name: collection.name,
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
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.delete(databaseId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$database.name} has been deleted`
            });
            await goto(`${base}/project-${page.params.region}-${page.params.project}/databases`);
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
        collectionItems = [];
    } else {
        listCollections();
    }
</script>

<Modal title="Delete database" bind:show={showDelete} onSubmit={handleDelete}>
    <p class="text" slot="description">
        {#if collectionItems.length > 0}
            The following collections and all data associated with <b>{$database.name}</b>, will be
            permanently deleted.
        {:else}
            Are you sure you want to delete <b>{$database.name}</b>?
        {/if}
    </p>

    {#if isLoadingDocumentsCount}
        <div class="u-flex u-main-center">
            <Spinner />
        </div>
    {:else if error}
        <p class="text">
            Are you sure you want to delete <b>{$database.name}</b>?
        </p>
    {:else if collectionItems.length > 0}
        <div class="u-flex-vertical u-gap-16">
            <Table.Root columns={2} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell {root}>Collection</Table.Header.Cell>
                    <Table.Header.Cell {root}>Last Updated</Table.Header.Cell>
                </svelte:fragment>
                {#each collectionItems as collection}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>{collection.name}</Table.Cell>
                        <Table.Cell {root}>{toLocaleDate(collection.updatedAt)}</Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>

            {#if collectionItems.length < collections.total}
                <div class="u-flex u-gap-16 u-cross-center">
                    <button class="u-underline" on:click={listCollections} type="button">
                        Show more
                    </button>

                    {#if isLoadingDocumentsCount}
                        <div class="loader is-small"></div>
                    {/if}
                </div>
            {:else if collectionItems.length > 25}
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
    {/if}

    {#if !isLoadingDocumentsCount}
        <p class="text" data-private>
            <b>
                Once deleted, this database and its backups cannot be restored. This action is
                irreversible.
            </b>
        </p>

        <div class="input-check-box-friction">
            <InputCheckbox
                required
                id="delete_policy"
                bind:checked={confirmedDeletion}
                label="I understand and confirm" />
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button danger submit disabled={!confirmedDeletion}>Delete</Button>
    </svelte:fragment>
</Modal>
