<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showActivate = false;
    export let selectedDeployment: Models.Deployment = null;

    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.updateDeployment(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
            showActivate = false;
            addNotification({
                type: 'success',
                message: $LL.components.notification.deploymentActivated()
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

<Modal bind:show={showActivate} onSubmit={handleSubmit}>
    <svelte:fragment slot="header"
        >{$LL.console.project.forms.functions.title.activeDeployment()}</svelte:fragment>
    <p>{$LL.console.project.forms.functions.texts.activateWarning()}</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showActivate = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.activate()}</Button>
    </svelte:fragment>
</Modal>
