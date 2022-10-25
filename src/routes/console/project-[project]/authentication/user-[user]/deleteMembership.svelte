<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let selectedMembership: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdkForProject.teams.deleteMembership(
                selectedMembership.teamId,
                selectedMembership.$id
            );
            invalidate(Dependencies.MEMBERSHIPS);
            showDelete = false;

            addNotification({
                type: 'success',
                message: `Membership has been deleted`
            });
            await goto(
                `${base}/console/project-${$page.params.project}/authentication/user-${selectedMembership.userId}/memberships`
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
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Member</svelte:fragment>
        <p>
            Are you sure you want to delete <b>{selectedMembership.userName}</b> from '{selectedMembership.teamName}'?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
