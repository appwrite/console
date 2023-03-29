<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText, InputPassword, FormList } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showCreate = false;
    export let selectedVar: Partial<Models.Variable> = null;

    let pair = {
        $id: selectedVar?.$id,
        key: selectedVar?.key,
        value: selectedVar?.value
    };

    const dispatch = createEventDispatcher();

    function close() {
        showCreate = false;
        selectedVar = null;
    }

    function handleVariable() {
        if (selectedVar) {
            dispatch('updated', pair);
        } else {
            dispatch('created', pair);
        }
        close();
    }
</script>

<Modal bind:show={showCreate} on:submit={handleVariable} size="big">
    <svelte:fragment slot="header">
        {selectedVar ? 'Update' : 'Create'} Environment Variable
    </svelte:fragment>
    <FormList>
        <InputText
            id="key"
            label="Key"
            placeholder="ENTER_KEY"
            bind:value={pair.key}
            required
            autofocus />
        <InputPassword
            id="value"
            label="Value"
            minlength={0}
            showPasswordButton
            placeholder="Enter value"
            bind:value={pair.value}
            required />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>Cancel</Button>
        <Button submit>{selectedVar ? 'Update' : 'Create'}</Button>
    </svelte:fragment>
</Modal>
