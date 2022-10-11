<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { key } from './store';

    export let showDelete = false;

    const handleDelete = async () => {
        try {
            await sdkForConsole.projects.deleteKey($project.$id, $key.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$key.name} has been deleted`
            });
            project.load($project.$id);
            await goto(`${base}/console/project-${$project.$id}/overview/keys`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={handleDelete}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete API Key</svelte:fragment>
        <p>The API Key will be permanently deleted. This action is irreversible.</p>

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
