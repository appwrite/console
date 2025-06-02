<script lang="ts">
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from './deleteModal.svelte';

    import { func } from '../store';

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete function</svelte:fragment>
    The function will be permanently deleted, including all deployments associated with it.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$func.name}</h6>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime($func.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete projectFunction={$func} bind:showDelete />
