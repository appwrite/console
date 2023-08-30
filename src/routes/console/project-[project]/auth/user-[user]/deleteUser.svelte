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

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdk.forProject.users.delete($user.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$user.name ? $user.name : 'User'} has been deleted`
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
    title="Delete user"
    bind:show={showDelete}
    onSubmit={deleteUser}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to delete <b>{$user.name}</b> from '{$project.name}'?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
