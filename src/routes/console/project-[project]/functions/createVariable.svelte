<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText, InputPassword, FormList } from '$lib/elements/forms';
    import { createFunction } from './wizard/store';

    export let showCreate = false;

    export let selectedKey: string = null;
    let key = selectedKey;
    let value = $createFunction?.vars[key];

    const create = () => {
        if (selectedKey) {
            delete Object.assign($createFunction.vars, {
                [key]: $createFunction.vars[selectedKey]
            })[selectedKey];
            $createFunction.vars[key] = value;
            selectedKey = null;
        } else {
            $createFunction.vars[key] = value;
        }
        showCreate = false;
    };
</script>

<Form single on:submit={create}>
    <Modal bind:show={showCreate} size="big">
        <svelte:fragment slot="header"
            >{selectedKey ? 'Update' : 'Create'} Variable</svelte:fragment>
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
            <Button submit>{selectedKey ? 'Update' : 'Create'}</Button>
        </svelte:fragment>
    </Modal>
</Form>
