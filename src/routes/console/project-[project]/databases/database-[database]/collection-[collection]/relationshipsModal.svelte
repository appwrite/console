<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { teamPrefs } from '$lib/stores/team';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let data: Models.Document;
    export let selectedRelationship: Models.AttributeRelationship = null;
    const limit = 10;
    let offset = 0;

    $: args = $teamPrefs?.displayNames?.[selectedRelationship.relatedCollection];

    $: if (!show) {
        data = null;
        selectedRelationship = null;
    }
</script>

<Modal size="big" bind:show icon="relationship">
    <svelte:fragment slot="header">
        {selectedRelationship.key}
    </svelte:fragment>
    {#each data?.[selectedRelationship.key] as doc, i}
        {#if i >= offset && i < offset + limit}
            {doc}
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
