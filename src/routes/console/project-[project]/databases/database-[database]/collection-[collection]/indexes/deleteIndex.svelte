<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from '../store';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';

    export let showDelete = false;
    export let selectedIndex: Models.Index;
    const databaseId = $page.params.database;

    const dispatch = createEventDispatcher();

    const handleDelete = async () => {
        try {
            await sdkForProject.databases.deleteIndex(
                databaseId,
                $collection.$id,
                selectedIndex.key
            );
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Index has been deleted`
            });
            dispatch('deleted');
            trackEvent('submit_index_delete');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal warning={true} on:submit={handleDelete} bind:show={showDelete}>
    <svelte:fragment slot="header">Delete Index</svelte:fragment>

    <p>
        Are you sure you want to delete <b>'{selectedIndex.key}' from {$collection.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
