<script lang="ts">
    import { Button } from '.';

    export let label: string = null;
    export let files: FileList;

    let list = new DataTransfer();
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

<input bind:files bind:this={input} type="file" style="display: none" />

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
            <div class="avatar is-size-large">
                <span class="icon-upload" aria-hidden="true" />
            </div>
            <div class="u-grid u-gap-16">
                <p>Drag and drop files here to upload</p>
                <div class="u-flex u-gap-8 ">
                    <Button secondary on:click={() => input.click()}>
                        <span class="icon-upload" aria-hidden="true" />
                        <span class="text">Choose File</span>
                    </Button>

                    {#if files?.length}
                        <div class="u-flex ">
                            {files.item(0).name}
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
