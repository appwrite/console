<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';

    export let showCancel = false;
    export let selectedDeployment: Models.Deployment;

    async function handleSubmit() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.updateDeploymentBuild(
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

<Modal
    title="Cancel deployment"
    bind:show={showCancel}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to cancel this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCancel = false)}>Cancel</Button>
        <Button secondary submit>Continue</Button>
    </svelte:fragment>
</Modal>
