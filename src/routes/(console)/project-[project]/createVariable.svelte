<script lang="ts">
    import { Button, InputChoice, InputPassword } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import Alert from '$lib/components/alert.svelte';
    import { project } from './store';
    import { base } from '$app/paths';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let isGlobal: boolean;
    export let product: 'function' | 'site' = 'function';
    export let showCreate = false;
    export let selectedVar: Partial<Models.Variable> = null;

    let pair = {
        $id: selectedVar?.$id,
        key: selectedVar?.key,
        value: selectedVar?.value,
        secret: selectedVar?.secret
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

<Modal
    bind:show={showCreate}
    onSubmit={handleVariable}
    title={`${selectedVar ? 'Update' : 'Create'} ${isGlobal ? 'global' : 'environment'} variable`}>
    <svelte:fragment slot="description">
        <span>
            Set the environment variables or secret keys that will be passed to {!isGlobal
                ? `your ${product}s`
                : `all functions and sites within your project`}.
        </span>
    </svelte:fragment>
    <Layout.Stack>
        {#if !isGlobal}
            <Alert type="info">
                <p class="text">
                    When there is a naming conflict with a global variable in your <a
                        href={`${base}/project-${$project.$id}/settings/variables`}
                        title="Project settings"
                        class="link">
                        project settings</a>
                    and a {product} environment variable, the global variable will be ignored.
                </p>
            </Alert>
        {/if}
        <InputText
            id="key"
            label="Key"
            placeholder="ENTER_KEY"
            bind:value={pair.key}
            required
            autofocus
            autocomplete={false} />
        <InputPassword
            id="value"
            label="Value"
            placeholder="Enter value"
            bind:value={pair.value}
            minlength={0} />
        <InputChoice id="secret" label="Secret" bind:value={pair.secret}>
            If selected, you and your team won't be able to read the values after creation.</InputChoice>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>Cancel</Button>
        <Button submit>{selectedVar ? 'Update' : 'Create'}</Button>
    </svelte:fragment>
</Modal>
