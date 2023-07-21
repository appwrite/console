<script lang="ts">
    import { Collapsible, CollapsibleItem, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputSelect, InputText } from '$lib/elements/forms';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createFunction } from '../store';
    import { sdk } from '$lib/stores/sdk';
    let showCustomId = false;

    let options = [];

    onMount(async () => {
        let runtimes = await sdk.forProject.functions.listRuntimes();
        options = runtimes.runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        }));
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Function configuration</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Set your deployment configuration and any build commands here.</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Function name"
            bind:value={$createFunction.name}
            required />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Function" bind:id={$createFunction.$id} />
        {/if}
        <InputSelect
            label="Runtime"
            id="runtime"
            placeholder="Select runtime"
            bind:value={$createFunction.runtime}
            {options}
            required />

        <InputText
            label="Entrypoint"
            id="entrypoint"
            placeholder="Entrypoint"
            bind:value={$createFunction.entrypoint}
            required />
        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Build commands</svelte:fragment>
                <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                <FormList>
                    <InputTextarea
                        label="Commands"
                        placeholder="Enter a build commad (e.g. 'npm install')"
                        id="build"
                        bind:value={$createFunction.commands} />
                </FormList>
            </CollapsibleItem>
        </Collapsible>
    </FormList>
</WizardStep>
