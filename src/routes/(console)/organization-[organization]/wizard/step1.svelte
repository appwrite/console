<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createProject } from './store';
    import { regionFlagUrls } from '../store';
    import { organization, regions } from '$lib/stores/organization';
    import { loadAvailableRegions } from '$routes/(console)/regions';

    let showCustomId = false;

    if (!$regions?.regions) {
        loadAvailableRegions($organization.$id);
    }
</script>

<svelte:head>
    {#each $regionFlagUrls as image}
        <link rel="preload" as="image" href={image} />
    {/each}
</svelte:head>

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
