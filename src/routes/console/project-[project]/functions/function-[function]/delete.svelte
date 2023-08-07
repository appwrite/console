<script lang="ts">
    import { invalidate } from '$app/navigation';
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;

    async function handleSubmit() {
        try {
            await sdk.forProject.functions.deleteDeployment(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
            await invalidate(Dependencies.FUNCTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: $LL.components.notification.deploymentDeleted()
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
    bind:show={showDelete}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header"
        >{$LL.console.project.forms.functions.title.deleteDeployment()}</svelte:fragment>
    <p data-private>{$LL.console.project.forms.functions.texts.deleteDeployment()}</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
