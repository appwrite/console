<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;
    export let selectedSessionId: string;

    async function deleteSession() {
        try {
            await sdk.forProject.users.deleteSession($page.params.user, selectedSessionId);
            await invalidate(Dependencies.SESSIONS);
            addNotification({
                type: 'success',
                message: $LL.components.notification.sessionDeleted()
            });
            trackEvent(Submit.SessionDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SessionDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteSession}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteSession()}</svelte:fragment>

    <p>{$LL.console.project.texts.users.deleteSession()}</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
