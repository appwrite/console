<script lang="ts">
    import { Button, Form, FormList, InputFile } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Modal, CustomId } from '$lib/components';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { uploader } from '$lib/stores/uploader';
    import { bucket } from './store';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Permissions } from '$lib/components/permissions';

    export let showCreate = false;

    const bucketId = $page.params.bucket;
    const dispatch = createEventDispatcher();

    let list = new DataTransfer();
    let files: FileList;
    let input: HTMLInputElement;
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
        } catch ({ message }) {
            error = message;
        }
    }

    $: if (!showCreate) {
        id = files = error = null;
        list = new DataTransfer();
        permissions = [];
    }
</script>

<input bind:files bind:this={input} type="file" style="display: none" />

<Form on:submit={create}>
    <Modal {error} bind:show={showCreate}>
        <svelte:fragment slot="header">Upload File</svelte:fragment>
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
            <Button submit>Upload</Button>
        </svelte:fragment>
    </Modal>
</Form>
