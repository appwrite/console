<script lang="ts">
    import { InnerModal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, InputSelect } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
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
                <InnerModal bind:show={showCustomId}>
                    <svelte:fragment slot="title">Function ID</svelte:fragment>
                    Enter a custom function ID. Leave blank for a randomly generated one.
                    <svelte:fragment slot="content">
                        <div class="form">
                            <InputText
                                id="id"
                                label="Custom ID"
                                showLabel={false}
                                placeholder="Enter ID"
                                autofocus={true}
                                bind:value={$createFunction.id} />

                            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                                <span
                                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                                    aria-hidden="true" />
                                <span class="text u-line-height-1-5">
                                    Allowed characters: alphanumeric, hyphen, non-leading
                                    underscore, period
                                </span>
                            </div>
                        </div>
                    </svelte:fragment>
                </InnerModal>
            {/if}
        </ul>
    </FormList>
</WizardStep>
