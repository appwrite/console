<script lang="ts">
    import { InputTags, InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Modal, Alert, InnerModal } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import { uploader } from '$lib/stores/uploader';
    import { bucket } from './store';
    import { bytesToSize } from '$lib/helpers/sizeConvertion';

    export let showCreate = false;

    const bucketId = $page.params.bucket;
    const dispatch = createEventDispatcher();

    let list = new DataTransfer();
    let files: FileList;
    let read: string[] = [];
    let write: string[] = [];
    let id: string = null;
    let showDropdown = false;

    const create = async () => {
        try {
            showCreate = false;
            showDropdown = false;
            const file = await uploader.uploadFile(bucketId, id, files[0], read, write);

            files = null;
            dispatch('created', file);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    function dropHandler(ev: DragEvent) {
        console.log(ev);
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
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
            }
        }
    }

    function dragOverHandler(ev: DragEvent) {
        console.log('File(s) in drop zone');
        ev.preventDefault();
    }

    $: if (!showCreate) {
        id = null;
        list = new DataTransfer();
        files = null;
        read = [];
        write = [];
    }

    $: if (!showDropdown) {
        id = null;
    }
</script>

<input bind:files id="file" type="file" style="display: none" />

<Form on:submit={create}>
    <Modal bind:show={showCreate}>
        <svelte:fragment slot="header">Upload File</svelte:fragment>
        <FormList>
            <div>
                <div
                    class="card is-border-dashed is-no-shadow"
                    on:drop|preventDefault={(e) => dropHandler(e)}
                    on:dragover|preventDefault={(e) => dragOverHandler(e)}>
                    <div class="u-flex u-main-center u-cross-center u-gap-32">
                        <div class="avatar is-size-large">
                            <span class="icon-upload" aria-hidden="true" />
                        </div>
                        <div class="u-grid u-gap-16">
                            <p>Drag and drop files here to upload</p>
                            <div>
                                <Button
                                    secondary
                                    on:click={() => {
                                        document.getElementById('file').click();
                                    }}>
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
                                        title="Remove file"
                                        ><span class="icon-x" aria-hidden="true" /></button
                                    >{/if}
                            </div>
                        </div>
                    </div>
                </div>

                <p>Max file size: {bytesToSize($bucket.maximumFileSize)}</p>
            </div>

            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}
                        ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                            File ID
                        </span></Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">File ID</svelte:fragment>
                    <p>Enter a custom file ID. Leave blank for a randomly generated file ID.</p>
                    <svelte:fragment slot="content">
                        <div class="form">
                            <InputText
                                id="id"
                                label="Custom ID"
                                showLabel={false}
                                placeholder="Enter ID"
                                autofocus={true}
                                bind:value={id} />

                            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                                <span
                                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                                    aria-hidden="true" />
                                <span class="text u-line-height-1-5"
                                    >Allowed characters: alphanumeric, hyphen, non-leading
                                    underscore, period</span>
                            </div>
                        </div>
                    </svelte:fragment>
                </InnerModal>
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
