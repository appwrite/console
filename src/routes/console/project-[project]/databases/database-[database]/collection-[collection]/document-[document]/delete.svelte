<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, Modal } from '$lib/components';
    import { Button, InputChoice } from '$lib/elements/forms';
    import { TableCellText, TableList } from '$lib/elements/table';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { attributes, collection } from '../store';

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
        SET_NULL = 'Set document ID as NULL in all related documents',
        CASCADE = 'All related documents will be deleted',
        RESTRICT = 'Document can not be deleted'
    }

    $: hasRelationship = $attributes?.some((attribute) => attribute.type === 'relationship');
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

    {#if hasRelationship}
        <TableList>
            {#each Array.from($attributes?.find((attribute) => attribute.type === 'relationship')) as attr}
                <li class="table-row">
                    <TableCellText title="relation">
                        {attr?.key}
                    </TableCellText>
                    <TableCellText title="Settings">
                        {attr?.deletion}
                    </TableCellText>
                    <TableCellText title="description">
                        {Deletion[attr?.deletion]}
                    </TableCellText>
                </li>
            {/each}
        </TableList>
        <Alert>To change the selection edit the relationship settings.</Alert>

        <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
            Delete document from {$collection.name}
        </InputChoice>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={hasRelationship && !checked}>Delete</Button>
    </svelte:fragment>
</Modal>
