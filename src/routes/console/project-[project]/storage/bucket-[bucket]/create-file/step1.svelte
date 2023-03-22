<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputFile } from '$lib/elements/forms';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { bucket } from '../store';
    import { createFile } from './store';

    let showCustomId = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Upload a File</svelte:fragment>
    <svelte:fragment slot="subtitle">Upload a file to add it to your bucket.</svelte:fragment>
    <FormList>
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
