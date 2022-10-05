<script lang="ts">
    import { InputTags, Button, Form, FormList } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Modal, Alert, CustomId } from '$lib/components';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { uploader } from '$lib/stores/uploader';
    import { bucket } from './store';
    import { calculateSize } from '$lib/helpers/sizeConvertion';

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

    function dropHandler(ev: DragEvent) {
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[i].kind === 'file') {
                    list.items.clear();
                    list.items.add(ev.dataTransfer.items[i].getAsFile());
                    files = list.files;
                }
            }
        }
    }

    function dragOverHandler(ev: DragEvent) {
        ev.preventDefault();
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
                <div
                    class="card is-border-dashed is-no-shadow"
                    on:drop|preventDefault={dropHandler}
                    on:dragover|preventDefault={dragOverHandler}>
                    <div class="u-flex u-main-center u-cross-center u-gap-32">
                        <div class="avatar is-size-large">
                            <span class="icon-upload" aria-hidden="true" />
                        </div>
                        <div class="u-grid u-gap-16">
                            <p>Drag and drop files here to upload</p>
                            <div>
                                <Button secondary on:click={input.click}>
                                    <span class="icon-upload" aria-hidden="true" />
                                    <span class="text">Choose File</span>
                                </Button>
                                {#if files?.length}
                                    {files.item(0).name}
                                    <button
                                        on:click={() => (files = null)}
                                        type="button"
                                        class="x-button"
                                        aria-label="remove file"
                                        title="Remove file">
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

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
            <Alert type="info">
                <p>
                    Tip: Add role:all for wildcard access. Check out our documentation for more on <a
                        class="link"
                        href="#?">
                        Permissions</a>
                </p>
            </Alert>
            <InputTags
                id="permissions"
                label="Permissions"
                bind:tags={permissions}
                placeholder="User ID, Team ID or Role" />
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Upload</Button>
        </svelte:fragment>
    </Modal>
</Form>
