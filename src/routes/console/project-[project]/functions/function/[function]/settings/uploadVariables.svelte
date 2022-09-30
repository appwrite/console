<script lang="ts">
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { createEventDispatcher } from 'svelte';
    import { variableList } from '../../../store';

    export let show = false;
    const dispatch = createEventDispatcher();

    const functionId = $page.params.function;
    let list = new DataTransfer();
    let files: FileList;
    let input: HTMLInputElement;

    const handleSubmit = async () => {
        if (files?.length) {
            const variables = await parseFile(files[0]);
            for (const variable of variables) {
                try {
                    await variableList.create(functionId, variable.key, variable.value);
                    addNotification({
                        type: 'success',
                        message: 'Variable uploaded'
                    });
                } catch (error) {
                    addNotification({
                        type: 'error',
                        message: error.message
                    });
                }
            }
            dispatch('uploaded', variables);
        } else {
            addNotification({
                type: 'error',
                message: 'No file uploaded'
            });
        }
    };

    async function parseFile(file: File) {
        if (file) {
            let variables = [];
            let text = await file.text();
            text.split('\n').forEach((line) => {
                const [key, value] = line.split('=');
                variables.push({ key, value });
            });
            return variables;
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
</script>

<input bind:files bind:this={input} type="file" style="display: none" />

<Form single on:submit={handleSubmit}>
    <Modal bind:show>
        <svelte:fragment slot="header">Upload Variables</svelte:fragment>
        <p>
            Upload multiple variables via a .env file that will be passed to your function at
            runtime.
        </p>

        <p class="text">Attach a file</p>
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
                        <Button secondary on:click={() => input.click()}>
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

        <svelte:fragment slot="footer">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
