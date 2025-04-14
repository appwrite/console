<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';

    export let showActivate = false;
    export let selectedDeployment: Models.Deployment = null;

    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.updateDeployment(selectedDeployment.resourceId, selectedDeployment.$id);
            showActivate = false;
            addNotification({
                type: 'success',
                message: `Deployment has been activated`
            });
            dispatch('activated');
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

<Modal
    title="Activate Deployment"
    bind:show={showActivate}
    onSubmit={handleSubmit}
    headerDivider={false}>
    <p>Are you sure you want to activate this deployment?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showActivate = false)}>Cancel</Button>
        <Button secondary submit>Activate</Button>
    </svelte:fragment>
</Modal>
