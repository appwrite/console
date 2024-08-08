<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let show = false;
    export let handleEnableAll;
</script>

<Modal title="Enable all services" bind:show onSubmit={handleEnableAll}>
    <p class="text" data-private>All project services will be enabled.</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Enable all</Button>
    </svelte:fragment>
</Modal>
