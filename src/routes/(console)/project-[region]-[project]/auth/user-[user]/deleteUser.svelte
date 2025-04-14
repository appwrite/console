<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { user } from './store';

    export let showDelete = false;
    let error: string;
    const deleteUser = async () => {
        try {
            await sdk.forProject($page.params.region, $page.params.project).users.delete($user.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$user.name ? $user.name : 'User'} has been deleted`
            });
            trackEvent(Submit.UserDelete);
            await goto(`${base}/project-${$page.params.region}-${$page.params.project}/auth`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserDelete);
        }
    };
</script>

<Modal
    title="Delete user"
    bind:show={showDelete}
    onSubmit={deleteUser}
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:error>
    <p data-private>
        Are you sure you want to delete <b>{$user.name || 'User'}</b> from '{$project.name}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
