<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let showCreate = false;
    export let selectedRelationship: string = null;

    $: if (!showCreate) {
        selectedRelationship = null;
    }
</script>

<Modal size="big" bind:show={showCreate} icon="relationship">
    <svelte:fragment slot="header">
        {selectedRelationship}
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button secondary disabled={!selectedRelationship} on:click={() => (showCreate = false)}>
            Prev
        </Button>
        <Button secondary disabled={!selectedRelationship}>Next</Button>
    </svelte:fragment>
</Modal>
