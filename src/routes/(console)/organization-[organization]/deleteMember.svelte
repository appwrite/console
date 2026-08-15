<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { user } from '$lib/stores/user';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { checkForUsageLimit } from '$lib/stores/billing';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { logout } from '$lib/helpers/logout';
    import Confirm from '$lib/components/confirm.svelte';
    import { InputCheckbox } from '$lib/elements/forms';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import {
        canPermanentlyDeleteConsoleUser,
        resolveConsoleUserDeletionMode
    } from '$lib/helpers/consoleUsers';

    let {
        showDelete = $bindable(false),
        selectedMember = undefined,
        ondeleted
    }: {
        showDelete?: boolean;
        selectedMember?: Models.Membership;
        ondeleted?: () => void;
    } = $props();

    let error = $state<string>(null);
    let permanentlyDelete = $state(false);

    const isUser = $derived(selectedMember?.userId === $user?.$id);
    const canPermanentlyDelete = $derived(
        canPermanentlyDeleteConsoleUser({
            isSelfHosted,
            actorUserId: $user?.$id,
            targetUserId: selectedMember?.userId
        })
    );
    const deletionMode = $derived(
        resolveConsoleUserDeletionMode({
            permanentlyDeleteRequested: permanentlyDelete,
            canPermanentlyDelete
        })
    );

    $effect(() => {
        if (showDelete) {
            permanentlyDelete = false;
            error = null;
        }
    });

    const deleteMembership = async () => {
        try {
            if (deletionMode === 'permanent') {
                // Permanent system-wide account deletion (self-hosted only).
                // Single Users API call — the deletes worker cleans memberships.
                // Do NOT delete membership first: a partial failure would leave a
                // shadow account and make retries fail on the already-removed membership.
                await sdk.forConsoleUsersInOrganization(selectedMember.teamId).delete({
                    userId: selectedMember.userId
                });
            } else {
                await sdk.forConsole.teams.deleteMembership({
                    teamId: selectedMember.teamId,
                    membershipId: selectedMember.$id
                });
            }

            if (isUser) {
                logout();
            } else {
                ondeleted?.();
            }

            await Promise.all([
                invalidate(Dependencies.ACCOUNT),
                invalidate(Dependencies.MEMBERS),
                invalidate(Dependencies.CONSOLE_USERS)
            ]);

            if (isCloud && $organization) {
                await checkForUsageLimit($organization);
            }
            showDelete = false;

            if (deletionMode === 'permanent') {
                addNotification({
                    type: 'success',
                    message: `${selectedMember.userName || selectedMember.userEmail || 'User'} was permanently deleted from the system`
                });
                trackEvent(Submit.ConsoleUserDelete);
            } else {
                addNotification({
                    type: 'success',
                    message: `${selectedMember.userName || 'User'} was deleted from ${selectedMember.teamName}`
                });
                trackEvent(Submit.MemberDelete);
            }
        } catch (e) {
            error = e.message;
            trackError(
                e,
                deletionMode === 'permanent' ? Submit.ConsoleUserDelete : Submit.MemberDelete
            );
        }
    };
</script>

<Confirm
    onSubmit={deleteMembership}
    submissionLoader
    title={isUser
        ? 'Leave organization'
        : deletionMode === 'permanent'
          ? 'Delete account permanently'
          : 'Delete member'}
    bind:open={showDelete}
    action={isUser ? 'Leave' : deletionMode === 'permanent' ? 'Delete permanently' : 'Delete'}
    confirmDeletion={deletionMode === 'permanent'}
    confirmDeletionLabel="I understand this permanently deletes the account from the entire system"
    bind:error>
    <Layout.Stack gap="m">
        {#if isUser}
            <Typography.Text>
                Are you sure you want to leave '{selectedMember?.teamName}'?
            </Typography.Text>
        {:else}
            <Typography.Text>
                Are you sure you want to remove
                <b>{selectedMember?.userName || selectedMember?.userEmail || 'this user'}</b>
                from '{selectedMember?.teamName}'?
            </Typography.Text>
            {#if canPermanentlyDelete}
                <InputCheckbox
                    size="s"
                    id="permanently_delete_console_user"
                    bind:checked={permanentlyDelete}
                    label="Also permanently delete their account from the entire system" />
                {#if permanentlyDelete}
                    <Typography.Text>
                        This removes the account system-wide — not just from this organization. They
                        will no longer be able to sign in or create organizations. This action cannot
                        be undone.
                    </Typography.Text>
                {/if}
            {/if}
        {/if}
    </Layout.Stack>
</Confirm>
