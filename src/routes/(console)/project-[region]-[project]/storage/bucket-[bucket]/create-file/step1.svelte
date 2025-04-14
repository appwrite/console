<script lang="ts">
    import { Alert, CustomId } from '$lib/components';
    import { page } from '$app/stores';
    import { Pill } from '$lib/elements';
    import { FormList, InputFile } from '$lib/elements/forms';
    import { humanFileSize, sizeToBytes } from '$lib/helpers/sizeConvertion';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { currentPlan } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { bucket } from '../store';
    import { createFile } from './store';
    import { base } from '$app/paths';

    let showCustomId = false;
    let fileError: string = null;
    const service = $currentPlan?.['fileSize'];
</script>

<WizardStep>
    <svelte:fragment slot="title">File</svelte:fragment>
    <svelte:fragment slot="subtitle">Upload a file to add it to your bucket.</svelte:fragment>

    {#if isCloud && fileError === 'File size exceeds the limit'}
        {@const size = humanFileSize($bucket.maximumFileSize ?? sizeToBytes(service, 'MB', 1000))}
        <Alert type="info">
            <p class="text">
                The maximum file upload size for this bucket is {parseInt(size.value)}{size.unit}.
                You can adjust it in your
                <a
                    href={`${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$bucket.$id}/settings`}
                    style:text-decoration="underline">bucket settings</a
                >.
            </p>
        </Alert>
    {/if}

    <FormList class="u-margin-block-start-24">
        <div class="u-width-full-line u-overflow-hidden">
            <InputFile
                required
                bind:files={$createFile.files}
                allowedFileExtensions={$bucket.allowedFileExtensions}
                bind:error={fileError}
                maxSize={isCloud
                    ? $bucket.maximumFileSize
                    : ($bucket.maximumFileSize ?? sizeToBytes(service, 'MB', 1000))} />
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
                <CustomId autofocus bind:show={showCustomId} name="File" bind:id={$createFile.id} />
            </div>
        {/if}
    </FormList>
</WizardStep>

<style lang="scss">
    .custom-id-wrapper :global(.is-inner-modal) {
        inline-size: auto;
    }
</style>
