<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { file } from './store';

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdkForProject.storage.deleteFile($file.response.bucketId, $file.response.$id);
            showDelete = false;
            await goto(
                `${base}/console/${$page.params.project}/storage/bucket/${$file.response.bucketId}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteUser}>
    <Modal bind:show={showDelete}>
        <svelte:fragment slot="header">Delete File</svelte:fragment>
        <p>Are you sure you want to delete <b>{$file.response.name}</b>?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
