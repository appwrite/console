<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from './store';
    import { project } from '../../../store';

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdkForProject.users.delete($user.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$user.name} has been deleted`
            });
            await goto(`${base}/console/${$page.params.project}/authentication`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteUser}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete User</svelte:fragment>
        <p>Are you sure you want to delete <b>{$user.name}</b> from '{$project.name}'?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
