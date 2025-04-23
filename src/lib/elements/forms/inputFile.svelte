<script lang="ts">
    import { Drop, Trim } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { type Component, onMount } from 'svelte';
    import { Helper, Label } from '.';
    import { Tooltip } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let files: FileList;

    export let allowedFileExtensions: string[] = [];
    export let maxSize: number = null;
    export let required = false;
    export let optionalText: string = null;
    export let tooltip: string = null;
    export let error: string = null;
    export let popover: Component = null;
    export let popoverProps: Record<string, unknown> = {};

    let input: HTMLInputElement;
    let hovering = false;
    let show = false;

    function setFiles(value: FileList) {
        if (!value) return;

        files = value;
        input.files = value;
    }

    function resetFiles() {
        setFiles(new DataTransfer().files);
    }

    function isFileExtensionAllowed(fileExtension: string) {
        if (allowedFileExtensions?.length && !allowedFileExtensions.includes(fileExtension)) {
            return false;
        }
        return true;
    }

    function isFileOverSize(file: File) {
        if (maxSize && file.size > maxSize) {
            return true;
        }
        return false;
    }
    function dropHandler(ev: DragEvent) {
        ev.dataTransfer.dropEffect = 'move';
        hovering = false;
        if (!ev.dataTransfer.items) return;
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            const fileExtension = ev.dataTransfer.items[i].getAsFile().name.split('.').pop();
            if (!isFileExtensionAllowed(fileExtension)) {
                error = 'Invalid file extension';
                return;
            }
            if (isFileOverSize(ev.dataTransfer.items[i].getAsFile())) {
                error = 'File size exceeds the limit';
                return;
            }
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

        const isValidFiles = Array.from(target.files).every((file) => {
            const fileExtension = file.name.split('.').pop();
            return isFileExtensionAllowed(fileExtension);
        });
        const isOverSize = maxSize && Array.from(target.files).some((file) => isFileOverSize(file));

        if (!isValidFiles) {
            error = 'Invalid file extension';
            target.value = '';
            return;
        }
        if (isOverSize) {
            error = 'File size exceeds the limit';
            target.value = '';
            return;
        }

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
            {label}{#if popover}
                <Drop isPopover bind:show display="inline-block">
                    <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                    &nbsp;<button
                        type="button"
                        on:click={() => (show = !show)}
                        aria-label="input tooltip">
                        <span
                            class="icon-info"
                            aria-hidden="true"
                            style="font-size: var(--icon-size-small)"></span>
                    </button>
                    <svelte:fragment slot="list">
                        <div
                            class="dropped card u-max-width-250"
                            style:--card-border-radius="var(--border-radius-small)"
                            style:--p-card-padding=".75rem"
                            style:box-shadow="var(--shadow-large)">
                            <svelte:component this={popover} {...popoverProps} />
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
                <span class="icon-upload" aria-hidden="true"></span>
            </div>
            <div class="u-min-width-0 u-text-center">
                <h5 class="upload-file-box-title heading-level-7 u-inline">
                    <span class="is-only-desktop">Drag and drop a file here to upload</span>
                    <span class="is-not-desktop">Upload a File</span>
                </h5>
                {#if allowedFileExtensions?.length}
                    <Tooltip>
                        <button
                            class="u-inline u-margin-inline-start-4"
                            aria-label="variables info">
                            <span class="icon-info" aria-hidden="true"></span>
                        </button>
                        <p slot="tooltip">Only {allowedFileExtensions.join(', ')} accepted.</p>
                    </Tooltip>
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
                        {@const fileName = file.name.split('.').slice(0, -1).join('.')}
                        {@const extension = file.name.split('.').pop()}
                        {@const fileSize = humanFileSize(file.size)}
                        <li class="u-flex u-cross-center u-min-width-0">
                            <span class="icon-document" aria-hidden="true"></span>
                            <span class="upload-file-box-name u-trim u-min-width-0">
                                <Trim>{fileName}</Trim>
                            </span>
                            <span class="upload-file-box-name u-min-width-0 u-flex-shrink-0">
                                .{extension}
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
                                <span class="icon-x" aria-hidden="true"></span>
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
