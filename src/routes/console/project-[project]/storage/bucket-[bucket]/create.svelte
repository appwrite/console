<script lang="ts">
    import { Button, FormList, InputFile } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Modal, CustomId } from '$lib/components';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { uploader } from '$lib/stores/uploader';
    import { bucket } from './store';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Permissions } from '$lib/components/permissions';
    import { addNotification } from '$lib/stores/notifications';

    export let showCreate = false;

    const bucketId = $page.params.bucket;
    const dispatch = createEventDispatcher();

    let files: FileList;
    let permissions: string[] = [];
    let id: string = null;
    let error: string;
    let showCustomId = false;

    async function create() {
        try {
            const file = await sdkForProject.storage.createFile(
                bucketId,
                id ?? 'unique()',
                files[0],
                permissions
            );
            files = null;
            showCreate = false;
            showCustomId = false;
            uploader.addFile(file);
            dispatch('created');
            addNotification({
                type: 'success',
                message: `${file.name} has been created`
            });
        } catch ({ message }) {
            error = message;
        }
    }

    $: if (!showCreate) {
        id = files = error = null;
        permissions = [];
    }
</script>

<Modal size="big" {error} bind:show={showCreate} on:submit={create}>
    <svelte:fragment slot="header">Create File</svelte:fragment>
    <FormList>
        <div>
            <InputFile bind:files />
            <p>Max file size: {calculateSize($bucket.maximumFileSize)}</p>
        </div>

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        File ID
                    </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="File" bind:id />
        {/if}
        <p class="heading-level-7">Permissions</p>
        <Permissions bind:permissions />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
