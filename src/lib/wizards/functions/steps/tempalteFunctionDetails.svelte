<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { templateConfig } from '../store';

    let showCustomId = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Function details</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Configure Appwrite Function you are about to create.</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Function name"
            bind:value={$templateConfig.name}
            required />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Function" bind:id={$templateConfig.$id} />
        {/if}
    </FormList>
</WizardStep>
