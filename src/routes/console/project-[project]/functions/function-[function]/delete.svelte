<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;

    const handleSubmit = async () => {
        try {
            await sdkForProject.functions.deleteDeployment(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
            await invalidate(Dependencies.FUNCTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Deployment has been deleted`
            });
            trackEvent('submit_deployment_delete');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={handleSubmit} warning>
    <svelte:fragment slot="header">Delete Deployment</svelte:fragment>
    <p data-private>Are you sure you want to delete this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
