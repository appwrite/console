<script lang="ts">
    import { getFileExt, getFileName } from '$lib/helpers/file';
    import { calculateSize } from '$lib/helpers/sizeConvertion';

    export let label: string = null;
    export let files: FileList;
    export let list = new DataTransfer();
    export let allowedFileExtensions: string[] = [];
    export let error: string = null;
    export let maxSize: number = null;

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
        console.log('aaaaa');
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
        class="box is-border-dashed is-no-shadow"
        class:is-hover-with-file={hovering}
        on:drop|preventDefault={dropHandler}
        on:dragover|preventDefault={dragOverHandler}
        on:dragleave|preventDefault={() => {
            hovering = false;
            console.log('bbbbb');
        }}>
        <div class="upload-file-box">
            <!-- TODO: Check if this should be a button or not -->
            <button type="button" on:click={() => input.click()} class="upload-file-box-image">
                <span class="icon-upload" aria-hidden="true" />
            </button>
            <div class="u-min-width-0">
                <div class="">
                    <h5 class="upload-file-box-title heading-level-7 u-inline">
                        <span class="is-only-desktop">Drag and drop files here to upload</span>
                        <span class="is-no-desktop">Upload a File</span>
                    </h5>
                    <button class="tooltip u-margin-inline-start-4" aria-label="variables info">
                        <span class="icon-info" aria-hidden="true" />
                        <span class="tooltip-popup" role="tooltip">
                            Set variables or secret keys that will be passed as env vars to your
                            function at runtime.
                        </span>
                    </button>
                </div>
                {#if maxSize}
                    <p class="upload-file-box-info body-text-2 u-normal">
                        Max file size: {calculateSize(maxSize)}
                    </p>
                {/if}
            </div>

            {#if files?.length}
                {@const fileName = getFileName(files.item(0).name)}
                {@const fileExt = getFileExt(files.item(0).name)}
                {@const fileSize = calculateSize(files.item(0).size)}
                <ul class="upload-file-box-list u-min-width-0">
                    <li class="u-flex u-cross-center u-min-width-0">
                        <span class="icon-document" aria-hidden="true" />
                        <span class="upload-file-box-name u-trim u-min-width-0">{fileName} </span>
                        <span class="upload-file-box-name u-min-width-0 u-flex-shrink-0">
                            .{fileExt}
                        </span>
                        <span
                            class="upload-file-box-size u-margin-inline-start-4 u-margin-inline-end-16 u-flex-shrink-0">
                            {fileSize}
                        </span>
                        <button
                            on:click={() => (files = null)}
                            type="button"
                            class="x-button u-margin-inline-start-16"
                            aria-label="remove file"
                            title="Remove file"><span class="icon-x" aria-hidden="true" /></button>
                    </li>
                </ul>
            {/if}
        </div>
    </div>
    {#if error}
        <p class="helper u-error u-margin-block-start-8">
            <span class="icon-exclamation-circle" aria-hidden="true" />
            <span class="text">{error}</span>
        </p>
    {/if}
</div>
