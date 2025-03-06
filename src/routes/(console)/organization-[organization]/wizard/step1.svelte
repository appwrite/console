<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { regionFlagUrls, regions } from '$routes/(console)/organization-[organization]/store';
    import { createProject } from './store';

    let showCustomId = false;

    if (!$regions?.regions) {
        sdk.forConsole.console.regions().then(regions.set);
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
