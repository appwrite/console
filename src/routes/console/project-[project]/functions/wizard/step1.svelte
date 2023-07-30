<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, InputSelect, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createFunction } from './store';
    import LL from '$i18n/i18n-svelte';
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
    <svelte:fragment slot="title"
        >{$LL.console.project.texts.functions.createYourFunction()}</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >{$LL.console.project.texts.functions.createFunction()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.functions.inputs.name.label()}
            placeholder={$LL.console.project.forms.functions.inputs.name.placeholder()}
            bind:value={$createFunction.name}
            required />

        <InputSelect
            id="runtime"
            label={$LL.console.project.forms.functions.inputs.runtime.label()}
            placeholder={$LL.console.project.forms.functions.inputs.runtime.placeholder()}
            bind:value={$createFunction.runtime}
            {options}
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">{$LL.console.project.table.pill.functionId()} </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Function" bind:id={$createFunction.id} />
        {/if}
    </FormList>
</WizardStep>
