<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { user } from './store';

    export let showDelete = false;
    let error: string;
    const deleteUser = async () => {
        try {
            await sdk.forProject(page.params.region, page.params.project).users.delete($user.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$user.name ? $user.name : 'User'} has been deleted`
            });
            trackEvent(Submit.UserDelete);
            await goto(`${base}/project-${page.params.region}-${page.params.project}/auth`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserDelete);
        }
    };
</script>

<Confirm onSubmit={deleteUser} title="Delete user" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$user.name || 'User'}</b> from <b>{$project.name}</b>?
    </Typography.Text>
</Confirm>
