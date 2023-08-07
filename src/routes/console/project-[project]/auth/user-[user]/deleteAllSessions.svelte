<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';
    import LL from '$i18n/i18n-svelte';

    export let showDeleteAll = false;

    async function deleteAllSessions() {
        try {
            await sdk.forProject.users.deleteSessions($page.params.user);
            await invalidate(Dependencies.SESSIONS);
            showDeleteAll = false;
            addNotification({
                type: 'success',
                message: $LL.components.notification.allSessionDeleted()
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
    bind:show={showDeleteAll}
    onSubmit={deleteAllSessions}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteAllSessions()}</svelte:fragment>
    <p data-private>
        {$LL.console.project.texts.users.deleteAllSession.phaseOne()}{' '}<b
            >{$LL.console.project.texts.users.deleteAllSession.allOf()}{' '}{$user.name}'s{' '}{$LL.console.project.texts.users.deleteAllSession.sessions()}</b>
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDeleteAll = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
