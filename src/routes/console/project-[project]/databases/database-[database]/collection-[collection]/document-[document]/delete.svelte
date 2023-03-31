<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, Modal } from '$lib/components';
    import { Button, InputChoice } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
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
                `${base}/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}`
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

    $: relAttributes = [
        $attributes?.find((attribute) => isRelationship(attribute))
    ] as Models.AttributeRelationship[];
</script>

<Modal
    icon="exclamation"
    state="warning"
    onSubmit={handleDelete}
    bind:show={showDelete}
    headerDivider={false}>
    <svelte:fragment slot="header">Delete Document</svelte:fragment>

    <p data-private>
        Are you sure you want to delete <b>the document from {$collection.name}</b>?
    </p>

    {#if relAttributes?.length}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={50}>Relation</TableCellHead>
                <TableCellHead width={50}>Setting</TableCellHead>
                <TableCellHead width={200} />
            </TableHeader>
            <TableBody>
                {#each relAttributes as attr}
                    <TableRow>
                        <TableCell title="relation">
                            <span class="u-flex u-cross-center u-gap-8">
                                {#if attr?.twoWay}
                                    <span class="icon-switch-horizontal" />
                                {:else}
                                    <span class="icon-arrow-sm-right" />
                                {/if}
                                {attr?.key}
                            </span>
                        </TableCell>
                        <TableCellText title="Settings">
                            {attr?.onDelete}
                        </TableCellText>
                        <TableCellText title="description">
                            {Deletion[attr?.onDelete]}
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
        <div class="u-flex u-flex-vertical u-gap-16">
            <Alert>To change the selection edit the relationship settings.</Alert>

            <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                Delete document from {$collection.name}
            </InputChoice>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={relAttributes?.length && !checked}>Delete</Button>
    </svelte:fragment>
</Modal>
