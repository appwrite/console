<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showRebuild = false;
    export let selectedDeployment: Models.Deployment = null;

    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.createBuild(
                selectedDeployment.resourceId,
                selectedDeployment.$id,
                selectedDeployment.buildId
            );
            showRebuild = false;
            addNotification({
                type: 'success',
                message: `Retrying build`
            });
            dispatch('rebuild');
            trackEvent(Submit.DeploymentUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DeploymentUpdate);
        }
    };
</script>

<Modal title="Retry build" bind:show={showRebuild} onSubmit={handleSubmit}>
    <p>Are you sure you want to retry building this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRebuild = false)}>Cancel</Button>
        <Button secondary submit>Retry build</Button>
    </svelte:fragment>
</Modal>
