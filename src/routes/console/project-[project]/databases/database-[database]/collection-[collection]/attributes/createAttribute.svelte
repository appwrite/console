<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, options } from './store';
    import { Button, InputText, FormList, InputSelect } from '$lib/elements/forms';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';

    export let showCreate = false;

    let key: string = null;
    let selectedOption = null;
    let submitted = false;

    const created = async () => {
        invalidate(Dependencies.COLLECTION);
        showCreate = false;
        addNotification({
            type: 'success',
            message: `Attribute has been created`
        });
    };

    $: if (selectedOption) {
        $option = options.find((option) => option.name === selectedOption);
    }

    $: if (!showCreate) {
        key = null;
        selectedOption = null;
        submitted = false;
    }
</script>

<Modal size="big" bind:show={showCreate} on:submit={() => (submitted = true)}>
    <svelte:fragment slot="header">Create Attribute</svelte:fragment>
    <FormList>
        <div>
            <InputText
                id="key"
                label="Attribute Key"
                placeholder="Enter Key"
                bind:value={key}
                autofocus
                required />

            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                <span
                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                    aria-hidden="true" />
                <span class="text u-line-height-1-5">
                    Allowed characters: alphanumeric, hyphen, non-leading underscore, period
                </span>
            </div>
        </div>

        <InputSelect
            options={options.map((n) => ({ value: n.name, label: n.name }))}
            id="type"
            label="Attribute type"
            placeholder="Select type"
            bind:value={selectedOption}
            required />
        {#if selectedOption}
            <svelte:component
                this={$option.component}
                {key}
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
