<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText, InputPassword, FormList } from '$lib/elements/forms';
    import { createFunction } from './wizard/store';

    export let showCreate = false;

    export let key: string = null;
    let value = $createFunction.vars[key];

    const create = async () => {
        showCreate = false;
        $createFunction.vars[key] = value;
    };
</script>

<Form on:submit={create}>
    <Modal bind:show={showCreate} size="big">
        <svelte:fragment slot="header">Create Variable</svelte:fragment>
        <FormList>
            <InputText id="key" label="Key" placeholder="Enter key" bind:value={key} required />
            <InputPassword
                id="value"
                label="Value"
                minlength={0}
                showPasswordButton
                placeholder="Enter value"
                bind:value
                required />
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
