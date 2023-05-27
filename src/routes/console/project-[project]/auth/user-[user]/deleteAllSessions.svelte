<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    const deleteAllSessions = async () => {
        try {
            await sdkForProject.users.deleteSessions($page.params.user);
            invalidate(Dependencies.SESSIONS);
            showDeleteAll = false;
            addNotification({
                type: 'success',
                message: 'All sessions have been deleted'
            });
            trackEvent('submit_session_delete_all');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal bind:show={showDeleteAll} on:submit={deleteAllSessions} warning>
    <svelte:fragment slot="header">Delete All Sessions</svelte:fragment>
    <p data-private>
        Are you sure you want to delete <b>all of {$user.name}'s sessions?</b>
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDeleteAll = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
