<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
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
            await goto(
                `${base}/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={handleDelete}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete Document</svelte:fragment>

        <p>
            Are you sure you want to delete <b>the document from {$collection.name}</b>?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
