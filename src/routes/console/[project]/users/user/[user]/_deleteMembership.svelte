<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from 'src/sdk';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMembership: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdkForProject.teams.deleteMembership(
                selectedMembership.teamId,
                selectedMembership.$id
            );
            showDelete = false;
            dispatch('deleted');
            await goto(
                `${base}/console/${$page.params.project}/users/user/${selectedMembership.userId}/memberships`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteMembership}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete member</svelte:fragment>
        <p>
            Are you sure you want to delete <b>{selectedMembership.userName}</b> from '{selectedMembership.teamName}'?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
