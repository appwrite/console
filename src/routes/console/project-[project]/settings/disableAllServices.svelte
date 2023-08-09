<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let show = false;
    export let handleDisableAll;
</script>

<Modal icon="exclamation" state="warning" bind:show onSubmit={handleDisableAll}>
    <svelte:fragment slot="title">Disable all services</svelte:fragment>
    <p class="text" data-private>
        Are you sure you want to disable all services? This will disable API requests to your
        project.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Disable All</Button>
    </svelte:fragment>
</Modal>
