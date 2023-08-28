<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { template, templateConfig } from '../store';

    let showCustomId = false;

    async function beforeSubmit() {
        if (!$templateConfig.runtime) {
            throw new Error('Please select a runtime.');
        }
    }

    async function loadRuntimes() {
        let runtimes = await sdk.forProject.functions.listRuntimes();
        const options = runtimes.runtimes
            .map((runtime) => ({
                label: `${runtime.name} - ${runtime.version}`,
                value: runtime.$id
            }))
            .filter((runtime) => {
                const allowedRuntimes = $template.runtimes.map((r) => r.name);
                return allowedRuntimes.includes(runtime.value);
            });

        return options;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">{$template.name}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$template.tagline}
    </svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Function name"
            bind:value={$templateConfig.name}
            required />
        {#await loadRuntimes()}
            <div class="avatar is-size-x-small">
                <div class="loader u-margin-16" />
            </div>
        {:then options}
            <InputSelect
                label="Runtime"
                id="runtime"
                placeholder="Select runtime"
                required
                disabled={options.length <= 1}
                {options}
                bind:value={$templateConfig.runtime} />
        {/await}
    </FormList>

    <div class="u-margin-block-start-24">
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID</span>
                </Pill>
            </div>
        {:else}
            <CustomId
                bind:show={showCustomId}
                name="Function"
                bind:id={$templateConfig.$id}
                fullWidth />
        {/if}
    </div>
</WizardStep>
