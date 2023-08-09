<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    const dispatch = createEventDispatcher();

    function handleSubmit() {
        dispatch('exit');
    }
</script>

<Modal title="Exit Process" bind:show onSubmit={handleSubmit} icon="exclamation" state="warning">
    <p>
        Are you sure you want to exit from <slot />? All data will be deleted. This action is
        irreversible.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Exit</Button>
    </svelte:fragment>
</Modal>
