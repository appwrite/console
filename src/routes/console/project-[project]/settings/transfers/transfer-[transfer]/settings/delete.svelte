<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';

    export let showDelete = false;
    const transferId = $page.params.transfer;

    const handleSubmit = async () => {
        try {
            await sdkForProject.transfers.delete(transferId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Transfer has been deleted`
            });
            await goto(`${base}/console/project-${$page.params.project}/settings/transfers`);
            trackEvent(Submit.TransferDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.TransferDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={handleSubmit} warning>
    <svelte:fragment slot="header">Delete Transfer</svelte:fragment>
    <p>Are you sure you want to delete this transfer and all in progress data from your project?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
