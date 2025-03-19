<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let show = false;
    export let handleDisableAll;
</script>

<Modal
    title="Disable all services"
    bind:show
    onSubmit={handleDisableAll}>
    <p class="text" data-private>
        Are you sure you want to disable all services? This will disable API requests to this
        project for all Client SDKs.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Disable All</Button>
    </svelte:fragment>
</Modal>
