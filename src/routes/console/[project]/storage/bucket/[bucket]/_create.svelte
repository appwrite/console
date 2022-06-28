<script lang="ts">
    import { InputTags, Button, InputFile, Form, FormList } from '$lib/elements/forms';
    import { Modal, Alert } from '$lib/components';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import { uploader } from '$lib/stores/uploader';

    export let showCreate = false;

    const bucket = $page.params.bucket;
    const dispatch = createEventDispatcher();

    let files: FileList;
    let read: string[] = [];
    let write: string[] = [];

    const create = async () => {
        try {
            const file = await sdkForProject.storage.createFile(
                bucket,
                'unique()',
                files[0],
                read,
                write
            );
            files = null;
            showCreate = false;
            uploader.addFile(file);
            dispatch('created');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    //TODO: add correct max file size
</script>

<Form on:submit={create}>
    <Modal bind:show={showCreate}>
        <svelte:fragment slot="header">Upload File</svelte:fragment>
        <FormList>
            <div>
                <InputFile id="file" label="File" bind:files required />
                <p>Max file size: 10MB</p>
            </div>

            <p class="heading-level-7">Permissions</p>
            <Alert type="info">
                <p>
                    Tip: Add role:all for wildcard access. Check out our documentation for more on <a
                        href="/#">
                        Permissions</a>
                </p>
            </Alert>
            <InputTags
                id="read"
                label="Read"
                bind:tags={read}
                placeholder="User ID, Team ID or Role" />
            <InputTags
                id="write"
                label="Write"
                bind:tags={write}
                placeholder="User ID, Team ID or Role" />
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Upload</Button>
        </svelte:fragment>
    </Modal>
</Form>
