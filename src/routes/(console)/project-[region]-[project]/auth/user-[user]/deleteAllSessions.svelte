<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    async function deleteAllSessions() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.deleteSessions($page.params.user);
            await invalidate(Dependencies.SESSIONS);
            showDeleteAll = false;
            addNotification({
                type: 'success',
                message: 'All sessions have been deleted'
            });
            trackEvent(Submit.SessionDeleteAll);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SessionDeleteAll);
        }
    }
</script>

<Modal
    title="Delete all sessions"
    bind:show={showDeleteAll}
    onSubmit={deleteAllSessions}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b>all of {$user.name || 'User'}'s sessions?</b>
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDeleteAll = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
