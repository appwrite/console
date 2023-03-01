<script lang="ts">
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { createEventDispatcher } from 'svelte';
    import { user } from '$lib/stores/user';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMember: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdkForConsole.teams.deleteMembership(selectedMember.teamId, selectedMember.$id);

            if (isUser) {
                await sdkForConsole.account.deleteSession('current');
                await goto(`${base}/login`);
            } else {
                dispatch('deleted');
            }
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedMember.userName} was deleted from ${selectedMember.teamName}`
            });
            trackEvent(Submit.MemberDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MemberDelete);
        }
    };

    $: isUser = selectedMember?.userId === $user?.$id;
</script>

<Modal bind:show={showDelete} on:submit={deleteMembership} icon="exclamation" state="warning">
    <svelte:fragment slot="header">
        {isUser ? 'Leave Organization' : 'Delete Member'}
    </svelte:fragment>
    <p>
        {isUser
            ? `Are you sure you want to leave '${selectedMember?.teamName}'?`
            : `Are you sure you want to delete ${selectedMember?.userName} from '${selectedMember?.teamName}'?`}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>{isUser ? 'Leave' : 'Delete'}</Button>
    </svelte:fragment>
</Modal>
