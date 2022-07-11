<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let file: Models.File;
    export let showDelete = false;

    const deleteFile = async () => {
        try {
            await sdkForProject.storage.deleteFile(file.bucketId, file.$id);
            showDelete = false;
            await goto(`${base}/console/${$page.params.project}/storage/bucket/${file.bucketId}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteFile}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete File</svelte:fragment>
        <p>Are you sure you want to delete <b>{file.name}</b>?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
