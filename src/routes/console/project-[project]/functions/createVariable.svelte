<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
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

    const handleVariable = () => {
        if (selectedVar) {
            dispatch('updated', pair);
        } else {
            dispatch('created', pair);
        }
        showCreate = false;
    };
</script>

<Form single on:submit={handleVariable}>
    <Modal bind:show={showCreate} size="big">
        <svelte:fragment slot="header"
            >{selectedVar ? 'Update' : 'Create'} Variable</svelte:fragment>
        <FormList>
            <InputText
                id="key"
                label="Key"
                placeholder="Enter key"
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
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>{selectedVar ? 'Update' : 'Create'}</Button>
        </svelte:fragment>
    </Modal>
</Form>
