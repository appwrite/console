<script lang="ts">
    import { Alert, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputFile } from '$lib/elements/forms';
    import { humanFileSize, sizeToBytes } from '$lib/helpers/sizeConvertion';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { getServiceLimit } from '$lib/stores/billing';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import { bucket } from '../store';
    import { createFile } from './store';

    let showCustomId = false;
    let showFileSizeWarning = false;
    const service = getServiceLimit('fileSize');

    async function checkFileSize() {
        if (!$createFile?.files?.length) return;
        const file = $createFile.files?.length ? Array.from($createFile.files)[0] : null;

        if (file.size > $bucket.maximumFileSize) {
            showFileSizeWarning = true;
            $wizard.interceptorNotificationEnabled = false;
            throw new Error('File size exceeds the maximum file size limit');
        }
    }
</script>

<WizardStep beforeSubmit={checkFileSize}>
    <svelte:fragment slot="title">Create file</svelte:fragment>
    <svelte:fragment slot="subtitle">Upload a file to add it to your bucket.</svelte:fragment>

    {#if isCloud && showFileSizeWarning}
        {@const size = humanFileSize(sizeToBytes(service, 'MB', 1000))}
        <Alert type="info">
            <p class="text">
                The maximum file upload size for this bucket is {Math.floor(
                    parseInt(size.value)
                )}{size.unit}. Edit this number in your bucket settings.
            </p>
        </Alert>
    {/if}

    <FormList class="u-margin-block-start-24">
        <div class="u-width-full-line u-overflow-hidden">
            <InputFile
                required
                bind:files={$createFile.files}
                allowedFileExtensions={$bucket.allowedFileExtensions}
                maxSize={$bucket.maximumFileSize} />
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
            <div class="custom-id-wrapper">
                <CustomId bind:show={showCustomId} name="File" bind:id={$createFile.id} />
            </div>
        {/if}
    </FormList>
</WizardStep>

<style lang="scss">
    .custom-id-wrapper :global(.is-inner-modal) {
        inline-size: auto;
    }
</style>
