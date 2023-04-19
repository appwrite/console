<script lang="ts">
    import { Trim } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { Helper } from '.';

    export let label: string = null;
    export let files: FileList;
    export let list = new DataTransfer();
    export let allowedFileExtensions: string[] = [];
    export let maxSize: number = null;
    export let required = false;
    export let error: string = null;

    let input: HTMLInputElement;
    let hovering = false;

    function dropHandler(ev: DragEvent) {
        ev.dataTransfer.dropEffect = 'move';
        hovering = false;
        if (ev.dataTransfer.items) {
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
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

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (input.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = input.validationMessage;
    };

    $: if (files) {
        error = null;
    }

    $: fileArray = files?.length ? Array.from(files) : [];
</script>

<input
    bind:files
    bind:this={input}
    accept={allowedFileExtensions.map((n) => `.${n}`).join(',')}
    type="file"
    style="display: none"
    {required}
    on:invalid={handleInvalid} />

<div>
    {#if label}
        <p class="text">{label}</p>
    {/if}
    <div
        class="box is-no-shadow u-padding-24"
        style="--box-border-radius:var(--border-radius-xsmall); z-index: 1"
        class:is-border-dashed={!hovering}
        class:is-hover-with-file={hovering}
        on:drop|preventDefault={dropHandler}
        on:dragover|preventDefault={dragOverHandler}
        on:dragenter|preventDefault
        on:dragleave|preventDefault={() => (hovering = false)}>
        <div class="upload-file-box">
            <div class="upload-file-box-image">
                <span class="icon-upload" aria-hidden="true" />
            </div>
            <div class="u-min-width-0 u-text-center">
                <h5 class="upload-file-box-title heading-level-7 u-inline">
                    <span class="is-only-desktop">Drag and drop a file here to upload</span>
                    <span class="is-not-desktop">Upload a File</span>
                </h5>
                {#if allowedFileExtensions?.length}
                    <button
                        class="tooltip u-inline u-margin-inline-start-4"
                        aria-label="variables info">
                        <span class="icon-info" aria-hidden="true" />
                        <span class="tooltip-popup" role="tooltip"
                            >Only {allowedFileExtensions.join(', ')} accepted.</span>
                    </button>
                {/if}
            </div>
            <div class="u-flex u-main-center u-cross-center u-gap-16 u-flex-vertical-mobile">
                {#if maxSize}
                    {@const readableMaxSize = humanFileSize(maxSize)}
                    <p class="upload-file-box-info body-text-2 u-normal">
                        Max file size: {readableMaxSize.value + readableMaxSize.unit}
                    </p>
                {/if}
                <button
                    class="button is-secondary is-full-width-mobile"
                    type="button"
                    on:click={() => input.click()}>
                    <span class="text">Choose a file</span>
                </button>
            </div>

            {#if files?.length}
                <ul class="upload-file-box-list u-min-width-0">
                    {#each fileArray as file}
                        {@const fileName = file.name.split('.')}
                        {@const fileSize = humanFileSize(file.size)}
                        <li class="u-flex u-cross-center u-min-width-0">
                            <span class="icon-document" aria-hidden="true" />
                            <span class="upload-file-box-name u-trim u-min-width-0">
                                <Trim>{fileName[0]}</Trim>
                            </span>
                            <span class="upload-file-box-name u-min-width-0 u-flex-shrink-0">
                                .{fileName[1]}
                            </span>
                            <span
                                class="upload-file-box-size u-margin-inline-start-4 u-margin-inline-end-16">
                                {fileSize.value + fileSize.unit}
                            </span>
                            <button
                                on:click={() => (files = null)}
                                type="button"
                                class="button is-text is-only-icon u-margin-inline-start-auto"
                                aria-label="remove file"
                                style="--button-size:1.5rem;">
                                <span class="icon-x" aria-hidden="true" />
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</div>
