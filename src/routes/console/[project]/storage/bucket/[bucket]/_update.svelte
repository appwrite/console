<script lang="ts">
    import { CopyInput, Modal } from '$lib/components';
    import { Button, Form, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from 'src/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showUpdate = false;
    export let file: Models.File = null;

    const dispatch = createEventDispatcher();

    const updateFile = async () => {
        try {
            await sdkForProject.storage.updateFile(
                file.bucketId,
                file.$id,
                file.$read,
                file.$write
            );
            showUpdate = false;
            dispatch('updated');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={updateFile}>
    <Modal bind:show={showUpdate}>
        <svelte:fragment slot="header">Update File</svelte:fragment>
        <CopyInput value={file.$id} />
        <InputTags
            bind:tags={file.$read}
            label="Read Access"
            id="read"
            helper="Add 'role:all' for wildcard access"
            placeholder="User ID, Team ID or Role" />
        <InputTags
            bind:tags={file.$write}
            label="Read Access"
            id="write"
            helper="Add 'role:all' for wildcard access"
            placeholder="User ID, Team ID or Role" />
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showUpdate = false)}>Cancel</Button>
            <Button submit>Update</Button>
        </svelte:fragment>
    </Modal>
</Form>
