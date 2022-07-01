<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from 'src/sdk';

    export let showDelete = false;
    export let team: Models.Team;

    const deleteTeam = async () => {
        try {
            await sdkForProject.teams.delete(team.$id);
            showDelete = false;
            await goto(`${base}/console/${$page.params.project}/users/teams`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteTeam}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete Team</svelte:fragment>

        <p>
            Are you sure you want to delete <b>{team.name}</b>?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
