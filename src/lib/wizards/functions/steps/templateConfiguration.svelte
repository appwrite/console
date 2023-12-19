<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { runtimesList } from '$routes/console/project-[project]/functions/store';
    import { template, templateConfig } from '../store';

    let showCustomId = false;

    async function beforeSubmit() {
        if (!$templateConfig.runtime) {
            throw new Error('Please select a runtime.');
        }
    }

    async function loadRuntimes() {
        const options = (await $runtimesList).runtimes
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
            autofocus
            bind:value={$templateConfig.name}
            required />
        {#await loadRuntimes()}
            <InputSelect
                label="Runtime"
                id="runtime"
                placeholder="Loading runtimes..."
                required
                disabled
                options={[]}
                value={null} />
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
