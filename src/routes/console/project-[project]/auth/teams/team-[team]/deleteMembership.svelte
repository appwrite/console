<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
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
            trackEvent(Submit.MemberDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/auth/teams/team-${selectedMembership.teamId}/members`
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

<Modal bind:show={showDelete} on:submit={deleteMembership} icon="exclamation" state="warning">
    <svelte:fragment slot="header">Delete Member</svelte:fragment>
    <p data-private>
        Are you sure you want to delete <b>{selectedMembership.userName}</b> from '{selectedMembership.teamName}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
