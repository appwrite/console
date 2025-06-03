<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Dialog, Layout } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let href: string = null;
    const dispatch = createEventDispatcher();

    function handleExit() {
        dispatch('exit');
        show = false;
    }
</script>

<Dialog title="Exit process" bind:open={show}>
    <slot />
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            {#if href}
                <Button secondary size="s" {href}>Exit</Button>
            {:else}
                <Button secondary size="s" on:click={handleExit}>Exit</Button>
            {/if}
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
