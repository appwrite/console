<script lang="ts">
    import { Drop, Trim } from '$lib/components';
    import FilePicker from '$lib/components/filePicker.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { Models } from '@appwrite.io/console';
    import { Button, Label } from '.';

    export let label: string = null;
    export let value: Models.File = null;
    export let disabled = false;

    export let optionalText: string = null;
    export let tooltip: string = null;
    export let isPopoverDefined = true;

    let show = false;

    function onSelect(file: Models.File) {
        value = file;
    }
</script>

<div>
    {#if label}
        <Label {optionalText} {tooltip} hide={!label}>
            {label}{#if $$slots.popover && isPopoverDefined}
                <Drop bind:show display="inline-block">
                    <!-- TODO: make un-clicked icon greyed out and hover and clicked filled -->
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
                            style="--p-card-padding: .75rem; box-shadow:var(--shadow-large);">
                            <slot name="popover" />
                        </div>
                    </svelte:fragment>
                </Drop>
            {/if}
        </Label>
    {/if}
    <div
        role="region"
        class="box is-no-shadow u-padding-24 is-border-dashed"
        style:--box-border-radius="var(--border-radius-xsmall)">
        <div class="upload-file-box">
            <div class="upload-file-box-image">
                <span class="icon-upload" aria-hidden="true"></span>
            </div>
            <div class="u-min-width-0 u-text-center">
                <h5 class="upload-file-box-title heading-level-7 u-inline">
                    <span class="is-only-desktop">Select a file to upload</span>
                    <span class="is-not-desktop">Select a file to upload</span>
                </h5>
            </div>
            <div class="u-flex u-main-center u-cross-center u-gap-16 u-flex-vertical-mobile">
                Max file size: 1MB
                <Button secondary {disabled} on:click={() => (show = true)}>Browse</Button>
            </div>

            {#if value}
                {@const fileSize = humanFileSize(value.sizeOriginal)}
                <ul class="upload-file-box-list u-min-width-0">
                    <li class="u-flex u-cross-center u-min-width-0">
                        <span class="icon-document" aria-hidden="true"></span>
                        <span class="upload-file-box-name u-min-width-0">
                            <Trim alternativeTrim>{value.name}</Trim>
                        </span>
                        <span
                            class="upload-file-box-size u-margin-inline-start-4 u-margin-inline-end-16">
                            {fileSize.value + fileSize.unit}
                        </span>
                        <button
                            on:click={() => (value = null)}
                            type="button"
                            class="button is-text is-only-icon u-margin-inline-start-auto"
                            aria-label="remove file"
                            style="--button-size:1.5rem;">
                            <span class="icon-x" aria-hidden="true"></span>
                        </button>
                    </li>
                </ul>
            {/if}
        </div>
    </div>
</div>

{#if show}
    <FilePicker selectedFile={value?.$id} selectedBucket={value?.bucketId} bind:show {onSelect} />
{/if}
