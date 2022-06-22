<script lang="ts">
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    const deleteAllSessions = async () => {
        try {
            await sdkForProject.users.deleteSessions($page.params.user);
            showDeleteAll = false;
            addNotification({
                type: 'success',
                message: 'All sessions have been deleted'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteAllSessions}>
    <Modal bind:show={showDeleteAll}>
        <svelte:fragment slot="header">Delete All Sessions</svelte:fragment>

        <p>
            Are you sure you want to delete <b>all of {$user.response.name}'s sessions?</b>
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDeleteAll = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
