<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Dialog, Layout } from '@appwrite.io/pink-svelte';

    export let show = false;

    export let currentVariable: Partial<Models.Variable> = null;
    export let variables: Partial<Models.Variable>[] = [];

    function deleteVariable() {
        variables = variables.filter((v) => v.key !== currentVariable.key);
        variables = [...variables];
        currentVariable = null;
        show = false;
    }

    $: if (!show) {
        currentVariable = null;
    }
</script>

<Dialog title="Delete variable" bind:open={show}>
    <p>Are you sure you want to delete this variable? This action is irreversible.</p>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button on:click={deleteVariable}>Delete</Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
