<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { webhook } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdkForConsole.projects.deleteWebhook($project.$id, $webhook.$id);
            await invalidate(Dependencies.WEBHOOKS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$webhook.name} has been deleted`
            });
            trackEvent(Submit.WebhookDelete);
            await goto(`${base}/console/project-${$project.$id}/settings/webhooks`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookDelete);
        }
    }
</script>

<Modal bind:show={showDelete} on:submit={handleDelete} icon="exclamation" state="warning">
    <svelte:fragment slot="header">Delete Webhook</svelte:fragment>
    <p>Are you sure you want to delete <b>{$webhook.name}</b> from '{$project.name}'?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
