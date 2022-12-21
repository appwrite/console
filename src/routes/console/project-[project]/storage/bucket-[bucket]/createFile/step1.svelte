<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputFile from '$lib/elements/forms/inputFile.svelte';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { wizard } from '$lib/stores/wizard';
    import { bucket } from '../store';
    import { store } from './store';

    let showCustomId = false;
    let error: string = null;

    async function beforeSubmit() {
        if (!$store.files?.length) {
            throw new Error('No file selected');
        }
    }

    $: {
        if (!$store.files?.length) {
            $wizard.nextDisabled = true;
            error = null;
        } else if ($store.files.item(0).size > $bucket.maximumFileSize) {
            $wizard.nextDisabled = true;
            error = `File size exceeds the maximum allowed size of ${calculateSize(
                $bucket.maximumFileSize
            )}`;
        } else {
            $wizard.nextDisabled = false;
            error = null;
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Upload a file</svelte:fragment>
    <svelte:fragment slot="subtitle">Upload a file to add it to your bucket.</svelte:fragment>
    <FormList>
        <InputFile
            bind:files={$store.files}
            allowedFileExtensions={$bucket.allowedFileExtensions}
            maxSize={$bucket.maximumFileSize}
            {error} />

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
