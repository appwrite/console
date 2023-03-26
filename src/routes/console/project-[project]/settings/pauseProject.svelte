<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { project } from '../store';

    export let show = false;
    export let handlePause;
</script>

<Modal warning={true} bind:show onSubmit={handlePause}>
    <svelte:fragment slot="header">Delete Database</svelte:fragment>
    <p class="text" data-private>
        Are you sure you want to pause <b>{$project.name}</b>? While paused, you will not be able to
        make API requests.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Pause my project</Button>
    </svelte:fragment>
</Modal>
