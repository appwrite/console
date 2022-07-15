<script lang="ts">
    import { Modal } from '$lib/components';
    // import { Pill } from '$lib/elements';
    import { option, options } from './attributes/store';
    import { Button, InputText, Form, FormList, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let key: string = null;
    let selectedOption = '';

    const create = async () => {
        try {
            console.log('test');
            showCreate = false;
            dispatch('created');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: if (selectedOption) {
        $option = options.find((option) => option.name === selectedOption);
    }
</script>

<Form on:submit={create}>
    <Modal size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create Attribute</svelte:fragment>
        <FormList>
            <InputText
                id="key"
                label="Attribute key"
                placeholder="Enter key"
                bind:value={key}
                autofocus
                required />

            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                <span
                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                    aria-hidden="true" />
                <span class="text u-line-height-1-5"
                    >Allowed characters: alphanumeric, hyphen, non-leading underscore, period</span>
            </div>

            <InputSelect
                options={options.map((n) => ({ value: n.name, label: n.name }))}
                id="type"
                label="Attribute type"
                bind:value={selectedOption}
                required />
            {#if selectedOption}
                <svelte:component
                    this={$option.component}
                    {key}
                    on:close={() => ($option = null)} />
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
