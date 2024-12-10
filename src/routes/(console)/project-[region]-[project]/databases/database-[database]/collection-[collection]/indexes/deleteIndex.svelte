<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let showDelete = false;
    export let selectedIndex: Models.Index;

    const databaseId = $page.params.database;

    async function handleDelete() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.deleteIndex(databaseId, $collection.$id, selectedIndex.key);
            await invalidate(Dependencies.COLLECTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Index has been deleted`
            });
            trackEvent(Submit.IndexDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.IndexDelete);
        }
    }
</script>

<Modal
    title="Delete index"
    icon="exclamation"
    state="warning"
    onSubmit={handleDelete}
    bind:show={showDelete}
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b>'{selectedIndex.key}' from {$collection.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
