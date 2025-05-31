<script lang="ts">
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import Delete from './deleteModal.svelte';

    export let site: Models.Site;
    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete site</svelte:fragment>
    The site will be permanently deleted, including all deployments associated with it.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{site.name}</h6>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime(site.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete {site} bind:showDelete />
