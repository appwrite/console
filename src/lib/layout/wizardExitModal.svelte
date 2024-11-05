<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let href: string = null;
    const dispatch = createEventDispatcher();

    function handleSubmit() {
        dispatch('exit');
        show = false;
    }
</script>

<Modal
    title="Exit Process"
    bind:show
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    size="small"
    headerDivider={false}>
    <p class="text">
        <slot />
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        {#if href}
            <Button secondary size="s" {href}>Exit</Button>
        {:else}
            <Button secondary size="s" submit>Exit</Button>
        {/if}
    </svelte:fragment>
</Modal>
