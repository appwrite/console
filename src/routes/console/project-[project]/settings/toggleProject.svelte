<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { project } from '../store';

    export let show = false;
    export let paused: boolean;
    export let handleToggle;
</script>

<Modal warning={true} bind:show onSubmit={handleToggle}>
    <svelte:fragment slot="header">{paused ? ' Resume' : 'Pause'} Project</svelte:fragment>
    <p class="text" data-private>
        {#if paused}
            Your project will be up-and-running again soon.
        {:else}
            Are you sure you want to pause <b>{$project.name}</b>? While paused, you will not be
            able to make API requests.
        {/if}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>{paused ? 'Resume' : 'Pause'} my project</Button>
    </svelte:fragment>
</Modal>
