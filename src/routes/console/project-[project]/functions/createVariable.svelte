<script lang="ts">
    import { Button, InputSecret } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText, FormList } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@appwrite.io/console';

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

<Modal bind:show={showCreate} onSubmit={handleVariable} size="big">
    <svelte:fragment slot="header">
        {selectedVar ? 'Update' : 'Create'} Variable
    </svelte:fragment>
    <FormList>
        <InputText
            id="key"
            label="Key"
            placeholder="Enter key"
            bind:value={pair.key}
            required
            autofocus
            autocomplete={false} />
        <InputSecret id="value" label="Value" placeholder="Enter value" bind:value={pair.value} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>Cancel</Button>
        <Button submit>{selectedVar ? 'Update' : 'Create'}</Button>
    </svelte:fragment>
</Modal>
