<script lang="ts">
    import { page } from '$app/stores';
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createProject } from './store';
    import { loadAvailableRegions } from '$routes/(console)/regions';

    let showCustomId = false;

    loadAvailableRegions($page.params.organization);
</script>

<WizardStep>
    <svelte:fragment slot="title">Details</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Project name"
            bind:value={$createProject.name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Project ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId
                autofocus
                bind:show={showCustomId}
                name="Project"
                isProject={true}
                bind:id={$createProject.id}
                fullWidth />
        {/if}
    </FormList>
</WizardStep>
