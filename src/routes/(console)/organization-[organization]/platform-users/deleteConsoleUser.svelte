<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { user } from '$lib/stores/user';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import Confirm from '$lib/components/confirm.svelte';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { isSelfHosted } from '$lib/system';
    import { canPermanentlyDeleteConsoleUser } from '$lib/helpers/consoleUsers';

    export let showDelete = false;
    export let selectedUser: Models.User<Record<string, unknown>> | null = null;

    let error: string;

    $: isSelf = selectedUser?.$id === $user?.$id;
    $: allowed = canPermanentlyDeleteConsoleUser({
        isSelfHosted,
        actorUserId: $user?.$id,
        targetUserId: selectedUser?.$id
    });
    $: if (showDelete) {
        error = null;
    }

    const deleteUser = async () => {
        if (!selectedUser || !allowed) {
            error = isSelf
                ? 'You cannot permanently delete your own account from this page.'
                : 'Permanent account deletion is not available.';
            return;
        }

        try {
            await sdk.forConsoleInOrganization(page.params.organization).users.delete({
                userId: selectedUser.$id
            });

            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedUser.name || selectedUser.email || 'User'} was permanently deleted from the system`
            });
            trackEvent(Submit.ConsoleUserDelete);
            await Promise.all([
                invalidate(Dependencies.CONSOLE_USERS),
                invalidate(Dependencies.MEMBERS),
                invalidate(Dependencies.ACCOUNT)
            ]);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ConsoleUserDelete);
        }
    };
</script>

<Confirm
    onSubmit={deleteUser}
    submissionLoader
    title="Delete account permanently"
    action="Delete permanently"
    confirmDeletion
    confirmDeletionLabel="I understand this permanently deletes the account from the entire system"
    disabled={!allowed}
    bind:open={showDelete}
    bind:error>
    <Typography.Text>
        Are you sure you want to permanently delete
        <b>{selectedUser?.name || selectedUser?.email || 'this user'}</b>
        from the entire Appwrite system?
    </Typography.Text>
    <Typography.Text>
        They will lose access to all organizations and will no longer be able to sign in. Memberships
        are cleaned up automatically. Organizations they solely owned may be left without an owner
        until cleaned up. This action cannot be undone.
    </Typography.Text>
    {#if isSelf}
        <Typography.Text>
            You cannot delete your own account here. Use Account → Delete account instead.
        </Typography.Text>
    {/if}
</Confirm>
