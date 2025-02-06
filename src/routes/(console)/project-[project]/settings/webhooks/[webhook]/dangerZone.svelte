<script lang="ts">
    import { BoxAvatar, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { webhook } from './store';
    import Delete from './delete.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete Webhooks</svelte:fragment>
    The webhook will be permanently deleted. This action is irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$webhook.name}</h6>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime($webhook.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
