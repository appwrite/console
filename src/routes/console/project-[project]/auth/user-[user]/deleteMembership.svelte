<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
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
            trackEvent(Submit.MemberDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/auth/user-${selectedMembership.userId}/memberships`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MemberDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={deleteMembership} warning>
    <svelte:fragment slot="header">Delete Member</svelte:fragment>
    {#if selectedMembership}
        <p>
            Are you sure you want to delete <b>{selectedMembership.userName}</b> from '{selectedMembership.teamName}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
