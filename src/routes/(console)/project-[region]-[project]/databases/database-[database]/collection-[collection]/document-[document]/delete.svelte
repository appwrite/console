<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, Modal, Trim } from '$lib/components';
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
            await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.deleteDocument(
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
                `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}`
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

<Modal
    title="Delete document"
    icon="exclamation"
    state="warning"
    onSubmit={handleDelete}
    bind:show={showDelete}
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b
            >the document from <span data-private>{$collection.name}</span></b
        >?
    </p>

    {#if relAttributes?.length}
        <p class="text">This document contains the following relationships:</p>
        <TableScroll noMargin>
            <TableHeader>
                <TableCellHead width={70}>Relation</TableCellHead>
                <TableCellHead width={70}>Setting</TableCellHead>
                <TableCellHead width={200} />
            </TableHeader>
            <TableBody>
                {#each relAttributes as attr}
                    <TableRow>
                        <TableCell title="relation">
                            <span class="u-flex u-cross-center u-gap-8">
                                {#if attr.twoWay}
                                    <span class="icon-switch-horizontal" />
                                {:else}
                                    <span class="icon-arrow-sm-right" />
                                {/if}
                                <Trim>{attr.key}</Trim>
                            </span>
                        </TableCell>
                        <TableCellText title="Settings">
                            {attr.onDelete}
                        </TableCellText>
                        <TableCellText title="description">
                            {Deletion[attr.onDelete]}
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
        <div class="u-flex u-flex-vertical u-gap-16">
            <Alert>To change the selection edit the relationship settings.</Alert>

            <ul>
                <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                    Delete document from <span data-private>{$collection.name}</span>
                </InputChoice>
            </ul>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={relAttributes?.length && !checked}>Delete</Button>
    </svelte:fragment>
</Modal>
