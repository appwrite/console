<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, InputSelect, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createFunction } from '../store';
    import { runtimesList } from '$routes/console/project-[project]/functions/store';

    let showCustomId = false;

    let options = [];

    onMount(async () => {
        options = (await $runtimesList).runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        }));
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Details</svelte:fragment>
    <svelte:fragment slot="subtitle">Create and deploy your function manually.</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Function name"
            bind:value={$createFunction.name}
            required />

        <InputSelect
            label="Runtime"
            id="runtime"
            placeholder="Select runtime"
            bind:value={$createFunction.runtime}
            {options}
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId
                bind:show={showCustomId}
                name="Function"
                bind:id={$createFunction.$id}
                fullWidth />
        {/if}
    </FormList>
</WizardStep>
