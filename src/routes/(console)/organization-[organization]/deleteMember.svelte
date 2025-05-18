<script lang="ts">
    import { invalidate } from '$app/navigation';
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
    import { logout } from '$lib/helpers/logout';
    import Confirm from '$lib/components/confirm.svelte';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMember: Models.Membership;

    let error: string;

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
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedMember.userName || 'User'} was deleted from ${selectedMember.teamName}`
            });
            trackEvent(Submit.MemberDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberDelete);
        }
    };

    $: isUser = selectedMember?.userId === $user?.$id;
</script>

<Confirm
    onSubmit={deleteMembership}
    title={isUser ? 'Leave organization' : 'Delete member'}
    bind:open={showDelete}
    action={isUser ? 'Leave' : 'Delete'}
    bind:error>
    {isUser
        ? `Are you sure you want to leave '${selectedMember?.teamName}'?`
        : `Are you sure you want to delete ${selectedMember?.userName} from '${selectedMember?.teamName}'?`}
</Confirm>
