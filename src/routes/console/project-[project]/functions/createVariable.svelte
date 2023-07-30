<script lang="ts">
    import { Button, InputSecret } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText, FormList } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

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
        {selectedVar
            ? $LL.console.project.button.submit.update()
            : $LL.console.project.button.submit.create()} Variable
    </svelte:fragment>
    <FormList>
        <InputText
            id="key"
            label={$LL.console.project.forms.functions.inputs.key.label()}
            placeholder={$LL.console.project.forms.functions.inputs.key.placeholder()}
            bind:value={pair.key}
            required
            autofocus
            autocomplete={false} />
        <InputSecret
            id="value"
            label={$LL.console.project.forms.functions.inputs.value.label()}
            placeholder={$LL.console.project.forms.functions.inputs.value.placeholder()}
            bind:value={pair.value} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>{$LL.console.project.button.cancel()}</Button>
        <Button submit
            >{selectedVar
                ? $LL.console.project.button.submit.update()
                : $LL.console.project.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
