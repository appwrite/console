<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { bucket } from './store';

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.deleteBucket($bucket.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$bucket.name} has been deleted`
            });
            await goto(`${base}/project-${$page.params.region}-${$page.params.project}/storage`);
            trackEvent(Submit.BucketDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BucketDelete);
        }
    };
</script>

<Modal
    title="Delete bucket"
    bind:show={showDelete}
    onSubmit={deleteUser}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to delete <b>{$bucket.name}</b>?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
