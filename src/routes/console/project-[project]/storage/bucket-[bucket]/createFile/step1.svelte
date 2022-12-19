<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputFile from '$lib/elements/forms/inputFile.svelte';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { bucket } from '../store';
    import { store } from './store';

    let showCustomId = false;

    async function beforeSubmit() {
        if (!$store.files?.length) {
            throw new Error('No file selected');
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Upload a file</svelte:fragment>
    <svelte:fragment slot="subtitle">Upload a file to add it to your bucket.</svelte:fragment>
    <FormList>
        <div>
            <InputFile
                bind:files={$store.files}
                allowedFileExtensions={$bucket.allowedFileExtensions} />
            <p>Max file size: {calculateSize($bucket.maximumFileSize)}</p>
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
            <CustomId bind:show={showCustomId} name="File" bind:id={$store.id} />
        {/if}
    </FormList>
</WizardStep>
