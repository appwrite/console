<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let show = false;
    export let selectedRelationship: string = null;
    const limit = 10;
    let offset = 0;

    $: if (!show) {
        selectedRelationship = null;
    }
</script>

<Modal size="big" bind:show icon="relationship">
    <svelte:fragment slot="header">
        {selectedRelationship}
    </svelte:fragment>
    {#each selectedRelationship as relationship, i}
        {#if i >= offset && i < offset + limit}
            {relationship.data} {relationship.id}
        {/if}
    {/each}

    <svelte:fragment slot="footer">
        <Button secondary disabled={!!offset} on:click={() => offset - limit}>Prev</Button>
        <Button
            secondary
            disabled={selectedRelationship?.relationships?.length < offset}
            on:click={() => offset + limit}>Next</Button>
    </svelte:fragment>
</Modal>
