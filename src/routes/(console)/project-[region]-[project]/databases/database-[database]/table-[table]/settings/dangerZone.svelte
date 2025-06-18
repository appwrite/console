<script lang="ts">
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { collection } from '../store';
    import Delete from './deleteCollection.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete table</svelte:fragment>
    The table will be permanently deleted, including all the rows within it. This action is irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$collection.name}</h6>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime($collection.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            secondary
            on:click={() => {
                trackEvent(Click.DatabaseCollectionDelete);
                showDelete = true;
            }}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
