<script lang="ts">
    import { Drop, Trim } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { onMount } from 'svelte';
    import { Helper, Label } from '.';

    export let label: string = null;
    export let files: FileList;

    export let allowedFileExtensions: string[] = [];
    export let maxSize: number = null;
    export let required = false;
    export let optionalText: string = null;
    export let tooltip: string = null;
    export let error: string = null;

    let input: HTMLInputElement;
    let hovering = false;
    let show = false;

    function setFiles(value: FileList) {
        if (!value) return;

        const hasInvalidExt = Array.from(value).some((file) => {
            const fileExtension = file.name.split('.').pop();
            return allowedFileExtensions?.length
                ? !allowedFileExtensions.includes(fileExtension)
                : false;
        });
        if (hasInvalidExt) {
            error = 'Invalid file extension';
            return;
        }

        files = value;
        input.files = value;
    }

    function resetFiles() {
        setFiles(new DataTransfer().files);
    }

    function dropHandler(ev: DragEvent) {
        ev.dataTransfer.dropEffect = 'move';
        hovering = false;
        if (!ev.dataTransfer.items) return;
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(ev.dataTransfer.items[i].getAsFile());
                setFiles(dataTransfer.files);
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

    onMount(() => {
        setFiles(files);
    });

    const handleChange = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        setFiles(target.files);
    };
</script>

<input
    on:change={handleChange}
    bind:this={input}
    accept={allowedFileExtensions.map((n) => `.${n}`).join(',')}
    type="file"
    style="display: none"
    {required}
    on:invalid={handleInvalid} />

<div>
    {#if label}
        <Label {required} {optionalText} {tooltip} hide={!label}>
            {label}{#if $$slots.popover}
                <Drop bind:show display="inline-block">
                    <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                    &nbsp;<button
                        type="button"
                        on:click={() => (show = !show)}
                        class="tooltip"
                        aria-label="input tooltip">
                        <span
                            class="icon-info"
                            aria-hidden="true"
                            style="font-size: var(--icon-size-small)" />
                    </button>
                    <svelte:fragment slot="list">
                        <div class="dropped card u-max-width-250" style="--p-card-padding: .75rem">
                            <slot name="popover" />
                        </div>
                    </svelte:fragment>
                </Drop>
            {/if}
        </Label>
    {/if}
    <div
        role="region"
        class="box is-no-shadow u-padding-24"
        style="--box-border-radius:var(--border-radius-xsmall); z-index: 1"
        class:u-margin-block-start-8={!!label}
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
                    <p class="upload-file-box-info body-text-2">
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
                                on:click|preventDefault={resetFiles}
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
