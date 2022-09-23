<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { platform } from './store';

    export let showDelete = false;

    const handleDelete = async () => {
        try {
            await sdkForConsole.projects.deletePlatform($project.$id, $platform.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$platform.name} has been deleted`
            });
            project.load($project.$id);
            await goto(`${base}/console/project-${$project.$id}/overview/platforms`);
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
        <svelte:fragment slot="header">Delete Platform</svelte:fragment>
        <p>The Platform will be permanently deleted. This action is irreversible.</p>

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
