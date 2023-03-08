<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.deleteDeployment(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
            await invalidate(Dependencies.FUNCTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Deployment has been deleted`
            });
            trackEvent(Submit.DeploymentDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DeploymentDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={handleSubmit} warning>
    <svelte:fragment slot="header">Delete Deployment</svelte:fragment>
    <p>Are you sure you want to delete this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
