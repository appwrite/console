<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, InputSelect, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createFunction } from '../store';
    import { runtimesList } from '$lib/stores/runtimes';
    import { specificationsList } from '$lib/stores/specifications';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import SpecificationsTooltip from '../components/specificationsTooltip.svelte';

    let showCustomId = false;

    let options = [];
    let specificationOptions = [];

    onMount(async () => {
        options = (await $runtimesList).runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        }));

        specificationOptions = (await $specificationsList).specifications.map((size) => ({
            label:
                `${size.cpus} CPU, ${size.memory} MB RAM` +
                (!size.enabled ? ` (Upgrade to use this)` : ''),
            value: size.slug,
            disabled: !size.enabled
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
            autofocus
            bind:value={$createFunction.name}
            required />

        <InputSelect
            label="Runtime"
            id="runtime"
            placeholder="Select runtime"
            bind:value={$createFunction.runtime}
            {options}
            required />

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
            bind:value={$createFunction.specification} />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId
                autofocus
                bind:show={showCustomId}
                name="Function"
                bind:id={$createFunction.$id}
                fullWidth />
        {/if}
    </FormList>
</WizardStep>
