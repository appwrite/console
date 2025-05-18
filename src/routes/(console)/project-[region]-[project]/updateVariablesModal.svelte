<script lang="ts">
    import { Button, InputPassword } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { project } from './store';
    import { base } from '$app/paths';
    import { Alert, Layout, Selector } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';

    export let isGlobal: boolean;
    export let product: 'function' | 'site' = 'function';
    export let show = false;
    export let selectedVar: Partial<Models.Variable>;

    let pair = {
        $id: selectedVar?.$id,
        key: selectedVar?.key,
        value: selectedVar?.value,
        secret: selectedVar?.secret
    };

    const dispatch = createEventDispatcher();

    function close() {
        show = false;
        selectedVar = null;
    }

    function handleVariable() {
        dispatch('updated', pair);

        close();
    }

    $: if (!show) {
        selectedVar = null;
    }
</script>

<Modal
    bind:show
    onSubmit={handleVariable}
    title={`Update ${isGlobal ? 'global' : 'environment'} variable`}>
    <svelte:fragment slot="description">
        <span>
            Set the environment variables or secret keys that will be passed to {!isGlobal
                ? `your ${product}`
                : `all functions and sites within your project`}.
        </span>
    </svelte:fragment>
    <Layout.Stack>
        {#if !isGlobal}
            <Alert.Inline>
                When there is a naming conflict with a global variable in your <Link
                    href={`${base}/project-${$project.region}-${$project.$id}/settings/variables`}>
                    project settings</Link>
                and a {product} environment variable, the global variable will be ignored.
            </Alert.Inline>
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
        <Selector.Checkbox
            id="secret"
            label="Secret"
            disabled={selectedVar.secret}
            bind:checked={pair.secret}
            description="If selected, you and your team won't be able to read the values after creation." />
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>Cancel</Button>
        <Button submit>Update</Button>
    </svelte:fragment>
</Modal>
