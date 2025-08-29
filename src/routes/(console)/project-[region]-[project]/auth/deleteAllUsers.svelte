<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDeleteAll = false;

    let error: string;

    async function deleteAllUsers() {
        try {
            const users = await sdk
                .forProject(page.params.region, page.params.project)
                .users.list();

            if (users.users.length === 0) {
                addNotification({
                    type: 'info',
                    message: 'No users to delete'
                });
                showDeleteAll = false;
                return;
            }

            const promises = users.users.map((user) =>
                sdk.forProject(page.params.region, page.params.project).users.delete(user.$id)
            );

            await Promise.all(promises);
            showDeleteAll = false;
            await invalidateAll();

            addNotification({
                type: 'success',
                message: `${users.users.length} user${users.users.length > 1 ? 's' : ''} have been deleted`
            });
            trackEvent(Submit.UserDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserDeleteAll);
        }
    }
</script>

<Confirm onSubmit={deleteAllUsers} title="Delete all users" bind:open={showDeleteAll} bind:error>
    Are you sure you want to delete all users? This action is irreversible.
</Confirm>
