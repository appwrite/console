<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { sendEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    const deleteAllMemberships = async () => {
        try {
            await sdkForProject.teams.deleteMembership('tmpstring', 'tmpstring2');
            showDeleteAll = false;
            addNotification({
                type: 'success',
                message: `All memberships have been deleted`
            });
            await goto(
                `${base}/console/project-${$page.params.project}/auth/${$user.$id}/membeships`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    //TODO: implelment delete all memberships
</script>

<Modal
    bind:show={showDeleteAll}
    on:submit={deleteAllMemberships}
    on:submit={() =>
        sendEvent({
            action: 'submit_auth_team_invite'
        })}
    warning>
    <svelte:fragment slot="header">Delete All Memberships</svelte:fragment>

    <p>
        Are you sure you want to delete <b>{$user.name}'s</b> all memberships?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDeleteAll = false)}>Cancel</Button>
        <Button secondary submit disabled>To implement Delete</Button>
    </svelte:fragment>
</Modal>
