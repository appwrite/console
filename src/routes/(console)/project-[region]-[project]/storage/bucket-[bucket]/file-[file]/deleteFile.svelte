<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { file } from './store';

    export let showDelete = false;

    const deleteFile = async () => {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.deleteFile($file.bucketId, $file.$id);
            showDelete = false;
            await goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$file.bucketId}`
            );
            addNotification({
                type: 'success',
                message: `${$file.name} has been deleted`
            });
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
        }
    };
</script>

<Modal
    title="Delete file"
    bind:show={showDelete}
    onSubmit={deleteFile}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to delete <b>{$file.name}</b>?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
