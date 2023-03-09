<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { createEventDispatcher } from 'svelte';

    export let file: Models.File;
    export let showDelete = false;

    const dispatch = createEventDispatcher();

    const deleteFile = async () => {
        try {
            await sdkForProject.storage.deleteFile(file.bucketId, file.$id);
            showDelete = false;
            dispatch('deleted', file);
            addNotification({
                type: 'success',
                message: `${file.name} has been deleted`
            });
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={deleteFile} icon="exclamation" state="warning">
    <svelte:fragment slot="header">Delete File</svelte:fragment>
    <p data-private>Are you sure you want to delete <b>{file.name}</b>?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
