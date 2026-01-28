<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import Confirm from '$lib/components/confirm.svelte';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { resolveRoute } from '$lib/stores/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;
    export let user: Models.User;
    export let project: Models.Project;

    let error: string;
    const deleteUser = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .users.delete({ userId: user.$id });
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${user.name ? user.name : 'User'} has been deleted`
            });
            trackEvent(Submit.UserDelete);
            await goto(resolveRoute('/(console)/project-[region]-[project]/auth', {
                ...page.params
            }));

        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserDelete);
        }
    };
</script>

<Confirm onSubmit={deleteUser} title="Delete user" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{user.name || 'User'}</b> from <b>{project.name}</b>?
    </Typography.Text>
</Confirm>
