<script lang="ts">
    import { BoxAvatar, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { collection } from '../store';
    import Delete from './deleteCollection.svelte';

    let showDelete = false;
</script>

<CardGrid danger>
    <Heading tag="h6" size="7">Delete collection</Heading>
    <p>
        The collection will be permanently deleted, including all the documents within it. This
        action is irreversible.
    </p>
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$collection.name}</h6>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime($collection.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
