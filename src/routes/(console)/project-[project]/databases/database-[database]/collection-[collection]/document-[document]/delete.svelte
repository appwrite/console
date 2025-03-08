<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, Trim } from '$lib/components';
    import { Button, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert, Selector, Table } from '@appwrite.io/pink-svelte';
    import { attributes, collection } from '../store';
    import { isRelationship } from './attributes/store';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    const databaseId = $page.params.database;
    let checked = false;

    const handleDelete = async () => {
        try {
            await sdk.forProject.databases.deleteDocument(
                databaseId,
                $page.params.collection,
                $page.params.document
            );
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Document has been deleted`
            });
            trackEvent(Submit.DocumentDelete);
            await goto(
                `${base}/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DocumentDelete);
        }
    };

    enum Deletion {
        'setNull' = 'Set document ID as NULL in all related documents',
        'cascade' = 'All related documents will be deleted',
        'restrict' = 'Document can not be deleted'
    }

    $: relAttributes = $attributes?.filter((attribute) =>
        isRelationship(attribute)
    ) as Models.AttributeRelationship[];
</script>

<Modal title="Delete document" onSubmit={handleDelete} bind:show={showDelete}>
    <p data-private>
        Are you sure you want to delete <b
            >the document from <span data-private>{$collection.name}</span></b
        >?
    </p>

    {#if relAttributes?.length}
        <p class="text">This document contains the following relationships:</p>
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell width="70px">Relation</Table.Header.Cell>
                <Table.Header.Cell width="70px">Setting</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each relAttributes as attr}
                <Table.Row>
                    <Table.Cell>
                        <span class="u-flex u-cross-center u-gap-8">
                            {#if attr.twoWay}
                                <span class="icon-switch-horizontal" />
                            {:else}
                                <span class="icon-arrow-sm-right" />
                            {/if}
                            <Trim>{attr.key}</Trim>
                        </span>
                    </Table.Cell>
                    <Table.Cell>
                        {attr.onDelete}
                    </Table.Cell>
                    <Table.Cell>
                        {Deletion[attr.onDelete]}
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Root>
        <div class="u-flex u-flex-vertical u-gap-16">
            <Alert.Inline
                title="To change these deletion behaviors edit the relationship settings." />
            <Selector.Checkbox
                id="delete"
                label={`Delete document from ${$collection.name}`}
                bind:checked />
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button danger submit disabled={relAttributes?.length && !checked}>Delete</Button>
    </svelte:fragment>
</Modal>
