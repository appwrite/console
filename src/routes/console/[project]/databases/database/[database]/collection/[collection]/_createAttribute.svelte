<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, options } from './attributes/store';
    import { Button, InputText, Form, FormList, InputSelect } from '$lib/elements/forms';
    import { collection } from './store';
    import type { Attributes } from './store';

    export let showCreate = false;

    let id: string = null;
    let selectedOption = '';
    let submitted = false;

    const created = async (event: CustomEvent<Attributes>) => {
        collection.addAttribute(event.detail);
        showCreate = false;
    };

    $: if (selectedOption) {
        $option = options.find((option) => option.name === selectedOption);
    }
</script>

<Form on:submit={() => (submitted = true)}>
    <Modal size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create Attribute</svelte:fragment>
        <FormList>
            <InputText
                id="ID"
                label="Attribute ID"
                placeholder="Enter ID"
                bind:value={id}
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
                    {id}
                    bind:submitted
                    on:created={created}
                    on:close={() => ($option = null)} />
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
