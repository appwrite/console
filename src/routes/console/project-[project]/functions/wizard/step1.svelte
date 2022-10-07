<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, InputSelect, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';

    let showCustomId = false;

    let options = [
        { label: 'Node.js 16.0', value: 'node-16.0' },
        { label: 'PHP 8.0', value: 'php-8.0' },
        { label: 'Ruby 3.0', value: 'ruby-3.0' },
        { label: 'Python 3.9', value: 'python-3.9' }
    ];
</script>

<WizardStep>
    <svelte:fragment slot="title">Create your function</svelte:fragment>
    <svelte:fragment slot="subtitle">Let’s create a function.</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Function name"
            bind:value={$createFunction.name}
            required />

        <InputSelect
            label="Runtimes"
            id="runtimes"
            placeholder="Select runtime"
            bind:value={$createFunction.runtime}
            {options}
            required />

        <ul class="form-list">
            {#if !showCustomId}
                <div>
                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Function ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <CustomId bind:show={showCustomId} name="Function" bind:id={$createFunction.id} />
            {/if}
        </ul>
    </FormList>
</WizardStep>
