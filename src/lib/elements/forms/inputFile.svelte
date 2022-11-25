<script lang="ts">
    import { Trim } from '$lib/components';
    import { Button } from '.';

    export let label: string = null;
    export let files: FileList;
    export let list = new DataTransfer();
    export let allowedFileExtensions: string[] = [];

    let input: HTMLInputElement;
    let hovering = false;

    function dropHandler(ev: DragEvent) {
        hovering = false;
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

    function dragOverHandler() {
        hovering = true;
    }
</script>

<input
    bind:files
    bind:this={input}
    accept={allowedFileExtensions.map((n) => `.${n}`).join(',')}
    type="file"
    style="display: none" />

<div>
    {#if label}
        <p class="text">{label}</p>
    {/if}
    <div
        class="card is-border-dashed is-no-shadow"
        class:is-hover-with-file={hovering}
        on:drop|preventDefault={dropHandler}
        on:dragover|preventDefault={dragOverHandler}
        on:dragleave|preventDefault={() => (hovering = false)}>
        <div class="u-flex u-main-center u-cross-center u-gap-32">
            <div class="avatar is-size-large u-min-width-0">
                <span class="icon-folder" aria-hidden="true" />
            </div>
            <div class="u-grid u-gap-16 u-min-width-0">
                <p>Drag and drop files here to upload</p>
                <div class="u-flex u-gap-8 u-min-width-0">
                    <Button secondary on:click={() => input.click()}>
                        <span class="icon-upload" aria-hidden="true" />
                        <span class="text">Choose File</span>
                    </Button>

                    {#if files?.length}
                        {@const fileName = files.item(0).name.split('.')}
                        <div class="u-flex u-cross-center u-min-width-0">
                            <Trim>{fileName[0]}</Trim>
                            <span class="u-min-width-0 u-flex-shrink-0 u-margin-inline-end-16"
                                >.{fileName[1]}</span>
                            <button
                                on:click={() => (files = null)}
                                type="button"
                                class="x-button"
                                aria-label="remove file"
                                title="Remove file">
                                <span class="icon-x" aria-hidden="true" />
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
