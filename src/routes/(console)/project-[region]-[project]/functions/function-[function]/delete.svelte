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

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;

    async function handleSubmit() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.deleteDeployment(selectedDeployment.resourceId, selectedDeployment.$id);
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
    }
</script>

<Modal
    title="Delete deployment"
    bind:show={showDelete}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to delete this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
