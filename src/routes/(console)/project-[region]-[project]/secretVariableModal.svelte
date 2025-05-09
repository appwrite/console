<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Dialog, Layout } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let show = false;

    export let selectedVar: Partial<Models.Variable>;
    let pair = {
        $id: selectedVar?.$id,
        key: selectedVar?.key,
        value: selectedVar?.value,
        secret: true
    };
    const dispatch = createEventDispatcher();
    function markAsSecret() {
        dispatch('updated', pair);

        selectedVar = null;
        show = false;
    }

    $: if (!show) {
        selectedVar = null;
    }
</script>

<Dialog title="Secret variable" bind:open={show}>
    <Layout.Stack gap="l">
        <p>
            Secret variables are hidden from both the UI and API. Once a variable is marked as
            secret, this action cannot be reversed.
        </p>
        <p>Are you sure you want to make this variable secret?</p>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button on:click={markAsSecret}>Mark as secret</Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
