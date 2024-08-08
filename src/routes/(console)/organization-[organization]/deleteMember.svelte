<script lang="ts">
    import { base } from '$app/paths';
    import { goto, invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { user } from '$lib/stores/user';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { checkForUsageLimit } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMember: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdk.forConsole.teams.deleteMembership(selectedMember.teamId, selectedMember.$id);

            if (isUser) {
                await sdk.forConsole.account.deleteSession('current');
                await goto(`${base}/login`);
            } else {
                dispatch('deleted');
            }
            invalidate(Dependencies.ACCOUNT);
            invalidate(Dependencies.MEMBERS);
            if (isCloud && $organization) {
                await checkForUsageLimit($organization);
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
