<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';
    import { project } from '../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdk.forProject.users.delete($user.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$user.name ? $user.name : 'User'} ${$LL.components.notification.hasBeenDeleted()}`
            });
            trackEvent(Submit.UserDelete);
            await goto(`${base}/console/project-${$page.params.project}/auth`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.UserDelete);
        }
    };
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteUser}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteUser()}</svelte:fragment>
    <p data-private>
        {$LL.console.project.texts.users.deleteUser.phaseOne()}{' '}<b>{$user.name}</b
        >{' '}{$LL.console.project.texts.users.deleteUser.phaseOne()}{' '}'{$project.name}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
