<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { database } from './store';
    const databaseId = $page.params.database;

    export let showDelete = false;

    const handleDelete = async () => {
        try {
            await sdkForProject.databases.delete(databaseId);
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

<Modal icon="exclamation" state="warning" bind:show={showDelete} on:submit={handleDelete}>
    <svelte:fragment slot="header">Delete Database</svelte:fragment>
    <p class="text">
        Are you sure you want to delete <b>{$database.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
