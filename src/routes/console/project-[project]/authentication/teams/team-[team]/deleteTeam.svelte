<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let team: Models.Team;

    const deleteTeam = async () => {
        try {
            await sdkForProject.teams.delete(team.$id);
            showDelete = false;
            await goto(`${base}/console/project-${$page.params.project}/authentication/teams`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={deleteTeam} warning>
    <svelte:fragment slot="header">Delete Team</svelte:fragment>

    <p>
        Are you sure you want to delete <b>{team.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
