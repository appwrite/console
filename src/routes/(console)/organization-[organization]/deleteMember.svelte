<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { logout } from '$lib/helpers/logout';
    import { checkForUsageLimit } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { isCloud } from '$lib/system';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMember: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdk.forConsole.teams.deleteMembership(selectedMember.teamId, selectedMember.$id);

            if (isUser) {
                logout();
            } else {
                dispatch('deleted');
            }
            invalidate(Dependencies.ACCOUNT);
            invalidate(Dependencies.MEMBERS);
            if (isCloud && $organization) {
                await checkForUsageLimit($organization);
            }
            addNotification({
                type: 'success',
                message: `${selectedMember.userName || 'User'} was deleted from ${selectedMember.teamName}`
            });
            trackEvent(Submit.MemberDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MemberDelete);
        } finally {
            showDelete = false;
        }
    };

    $: isUser = selectedMember?.userId === $user?.$id;
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteMembership}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="title">
        {isUser ? 'Leave organization' : 'Delete member'}
    </svelte:fragment>
    <p data-private>
        {isUser
            ? `Are you sure you want to leave '${selectedMember?.teamName}'?`
            : `Are you sure you want to delete ${selectedMember?.userName} from '${selectedMember?.teamName}'?`}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>{isUser ? 'Leave' : 'Delete'}</Button>
    </svelte:fragment>
</Modal>
