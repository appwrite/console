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
    title="Exit process"
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
            <Button secondary {href}>Exit</Button>
        {:else}
            <Button secondary submit>Exit</Button>
        {/if}
    </svelte:fragment>
</Modal>
