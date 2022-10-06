<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../../store';
    import { webhook } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdkForConsole.projects.deleteWebhook($project.$id, $webhook.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$webhook.name} has been deleted`
            });
            await goto(`${base}/console/project-${$project.$id}/settings/webhooks`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form on:submit={handleDelete}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Webhook</svelte:fragment>
        <p>Are you sure you want to delete <b>{$webhook.name}</b> from '{$project.name}'?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
