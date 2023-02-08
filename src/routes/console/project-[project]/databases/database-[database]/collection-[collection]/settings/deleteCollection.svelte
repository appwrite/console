<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { collection } from '../store';

    export let showDelete = false;

    const databaseId = $page.params.database;

    const handleDelete = async () => {
        try {
            await sdkForProject.databases.deleteCollection(databaseId, $collection.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$collection.name} has been deleted`
            });
            trackEvent('submit_collection_delete');
            await goto(
                `${base}/console/project-${$page.params.project}/databases/database-${$page.params.database}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal warning={true} bind:show={showDelete} on:submit={handleDelete}>
    <svelte:fragment slot="header">Delete Collection</svelte:fragment>

    <p>
        Are you sure you want to delete <b>{$collection.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
