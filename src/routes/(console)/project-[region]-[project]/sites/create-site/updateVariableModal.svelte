<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Selector } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import { getProjectRoute } from '$lib/helpers/project';

    export let show = false;
    export let selectedVar: Partial<Models.Variable>;
    export let variables: Partial<Models.Variable>[];

    let pair = {
        $id: selectedVar?.$id,
        key: selectedVar?.key,
        value: selectedVar?.value,
        secret: selectedVar?.secret
    };

    function handleVariable() {
        if (selectedVar) {
            variables = variables.map((variable) => {
                if (variable.$id === selectedVar.$id) {
                    return pair;
                }
                return variable;
            });
        } else {
            variables = [...variables, pair];
        }
        show = false;
    }

    $: if (!show) {
        selectedVar = null;
    }
</script>

<Modal bind:show onSubmit={handleVariable} title="Update variable">
    <span slot="description">
        Update the environment variable for your site. Global variables can be set in <Link
            variant="muted"
            href={getProjectRoute('/settings')}>project settings</Link
        >.
    </span>
    <Layout.Stack gap="xxl">
        <Layout.Stack direction="row">
            <InputText
                id="key"
                label="Key"
                placeholder="ENTER_KEY"
                bind:value={pair.key}
                required
                autofocus
                autocomplete={false} />
            <InputText id="value" label="Value" placeholder="Enter value" bind:value={pair.value} />
        </Layout.Stack>
        <Selector.Checkbox
            size="s"
            id="secret"
            label="Secret"
            bind:checked={pair.secret}
            description="If selected, you and your team won't be able to read the values after creation." />
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>{selectedVar ? 'Update' : 'Create'}</Button>
    </svelte:fragment>
</Modal>
