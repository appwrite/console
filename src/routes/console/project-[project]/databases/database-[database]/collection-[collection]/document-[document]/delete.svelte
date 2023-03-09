<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { collection } from '../store';

    export let showDelete = false;

    const databaseId = $page.params.database;

    const handleDelete = async () => {
        try {
            await sdkForProject.databases.deleteDocument(
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
</script>

<Modal warning={true} onSubmit={handleDelete} bind:show={showDelete}>
    <svelte:fragment slot="header">Delete Document</svelte:fragment>

    <p data-private>
        Are you sure you want to delete <b>the document from {$collection.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
