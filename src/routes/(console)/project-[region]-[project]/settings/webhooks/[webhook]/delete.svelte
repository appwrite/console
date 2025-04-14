<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { webhook } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deleteWebhook($project.$id, $webhook.$id);
            await invalidate(Dependencies.WEBHOOKS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$webhook.name} has been deleted`
            });
            trackEvent(Submit.WebhookDelete);
            await goto(`${base}/project-${$project.region}-${$project.$id}/settings/webhooks`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookDelete);
        }
    }
</script>

<Modal
    title="Delete webhook"
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b>{$webhook.name}</b> from '{$project.name}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
