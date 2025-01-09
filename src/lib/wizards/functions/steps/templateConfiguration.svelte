<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { runtimesList } from '$lib/stores/runtimes';
    import { specificationsList } from '$lib/stores/specifications';
    import { BillingPlan } from '$lib/constants';
    import SpecificationsTooltip from '../components/specificationsTooltip.svelte';
    import { template, templateConfig } from '../store';
    import { organization } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';

    let showCustomId = false;

    async function beforeSubmit() {
        if (!$templateConfig.runtime) {
            throw new Error('Please select a runtime.');
        }

        if (!$templateConfig.specification) {
            throw new Error('Please select a specification.');
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

    async function loadSpecifications() {
        const specificationOptions = (await $specificationsList).specifications.map((size) => ({
            label:
                `${size.cpus} CPU, ${size.memory} MB RAM` +
                (!size.enabled ? ` (Upgrade to use this)` : ''),
            value: size.slug,
            disabled: !size.enabled
        }));

        if (!$templateConfig.specification && specificationOptions.length > 0) {
            $templateConfig.specification = specificationOptions[0].value;
        }

        return specificationOptions;
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
                disabled={options.length < 1}
                {options}
                bind:value={$templateConfig.runtime} />
        {/await}
        {#await loadSpecifications()}
            <InputSelect
                label="CPU and memory"
                id="specification"
                placeholder="Loading specifications..."
                required
                disabled
                options={[]}
                value={null} />
        {:then specificationOptions}
            <InputSelect
                label="CPU and memory"
                id="specification"
                placeholder="Select specification"
                required
                disabled={specificationOptions.length < 1}
                options={specificationOptions}
                popover={isCloud && $organization?.billingPlan === BillingPlan.FREE
                    ? SpecificationsTooltip
                    : null}
                bind:value={$templateConfig.specification} />
        {/await}
    </FormList>

    <FormList class="u-margin-block-start-24">
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID</span>
                </Pill>
            </div>
        {:else}
            <CustomId
                autofocus
                bind:show={showCustomId}
                name="Function"
                bind:id={$templateConfig.$id}
                fullWidth />
        {/if}
    </FormList>
</WizardStep>
