<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { collection } from '../store';

    export let showDelete = false;

    const databaseId = $page.params.database;

    async function handleDelete() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.deleteCollection(databaseId, $collection.$id);
            await invalidate(Dependencies.DATABASE);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$collection.name} has been deleted`
            });
            trackEvent(Submit.CollectionDelete);
            await goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${$page.params.database}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.CollectionDelete);
        }
    }
</script>

<Modal
    title="Delete collection"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b>{$collection.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
