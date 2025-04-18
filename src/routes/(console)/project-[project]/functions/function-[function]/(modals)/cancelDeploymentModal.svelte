<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Confirm } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let showCancel = false;
    export let selectedDeployment: Models.Deployment;

    async function handleSubmit() {
        try {
            await sdk.forProject.functions.updateDeploymentStatus(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
            await invalidate(Dependencies.FUNCTION);
            showCancel = false;
            addNotification({
                type: 'success',
                message: `Deployment has been cancelled`
            });
            trackEvent(Submit.DeploymentCancel);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DeploymentCancel);
        }
    }
</script>

<Confirm title="Cancel deployment" bind:open={showCancel} onSubmit={handleSubmit}>
    <p data-private>Are you sure you want to cancel this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCancel = false)}>Cancel</Button>
        <Button secondary submit>Confirm</Button>
    </svelte:fragment>
</Confirm>
