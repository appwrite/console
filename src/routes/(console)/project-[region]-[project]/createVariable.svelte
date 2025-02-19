<script lang="ts">
    import { Button, InputSecret } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText, FormList } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import Alert from '$lib/components/alert.svelte';
    import { project } from './store';
    import { base } from '$app/paths';

    export let isGlobal: boolean;
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
    <svelte:fragment slot="title">
        {selectedVar ? 'Update' : 'Create'}
        {isGlobal ? 'global' : 'environment'} variable
    </svelte:fragment>
    <div class="u-flex u-flex-vertical u-gap-24">
        <p class="u-text">
            Set the environment variables or secret keys that will be passed to {isGlobal
                ? 'all functions within your project'
                : 'your function'}.
        </p>
        {#if !isGlobal}
            <Alert type="info">
                <p class="text">
                    When there is a naming conflict with a global variable in your <a
                        href={`${base}/project-${$project.region}-${$project.$id}/settings/variables`}
                        title="Project settings"
                        class="link">
                        project settings</a> and a function environment variable, the global variable
                    will be ignored.
                </p>
            </Alert>
        {/if}
    </div>
    <FormList>
        <InputText
            id="key"
            label="Key"
            placeholder="ENTER_KEY"
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
