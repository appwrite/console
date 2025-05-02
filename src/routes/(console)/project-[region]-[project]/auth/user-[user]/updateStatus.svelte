<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { AvatarInitials, CardGrid, DropList, DropListItem } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Badge, Icon, Typography } from '@appwrite.io/pink-svelte';
    import { user } from './store';
    import Avatar from '$lib/components/avatar.svelte';
    import { IconAnonymous, IconUser } from '@appwrite.io/pink-icons-svelte';

    let showVerificationDropdown = false;

    async function updateVerificationEmail() {
        showVerificationDropdown = false;
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updateEmailVerification($user.$id, !$user.emailVerification);
            await invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    !$user.emailVerification ? 'unverified' : 'verified'
                }`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateVerificationEmail);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateVerificationEmail);
        }
    }
    async function updateVerificationPhone() {
        showVerificationDropdown = false;
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updatePhoneVerification($user.$id, !$user.phoneVerification);
            await invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    $user.phoneVerification ? 'unverified' : 'verified'
                }`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateVerificationPhone);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateVerificationPhone);
        }
    }
    async function updateStatus() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updateStatus($user.$id, !$user.status);
            await invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    $user.status ? 'unblocked' : 'blocked'
                }`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateStatus);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateStatus);
        }
    }

    // TODO: Remove this when the console SDK is updated
    $: accessedAt = ($user as unknown as { accessedAt: string }).accessedAt;
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private>
        {#if $user.email || $user.phone}
            {#if $user.name}
                <AvatarInitials name={$user.name} />
                <Typography.Title size="s" truncate>{$user.name}</Typography.Title>
            {:else}
                <Avatar alt="avatar">
                    <Icon icon={IconUser} size="s" />
                </Avatar>
            {/if}
        {:else}
            <Avatar alt="avatar">
                <Icon icon={IconAnonymous} size="s" />
            </Avatar>
        {/if}
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div data-private>
                {#if $user.email}
                    <p class="title">{$user.email}</p>
                {/if}
                {#if $user.phone}
                    <p class="title">{$user.phone}</p>
                {/if}
                <p>Joined: {toLocaleDateTime($user.registration)}</p>
                <p>Last activity: {accessedAt ? toLocaleDate(accessedAt) : 'never'}</p>
            </div>
            <div>
                {#if !$user.status}
                    <Badge content="blocked" variant="secondary" type="warning" />
                {:else if $user.email && $user.phone}
                    <Badge
                        variant="secondary"
                        type={$user.emailVerification || $user.phoneVerification
                            ? 'success'
                            : undefined}
                        content={$user.emailVerification && $user.phoneVerification
                            ? 'verified'
                            : $user.emailVerification
                              ? 'verified email'
                              : $user.phoneVerification
                                ? 'verified phone'
                                : 'unverified'} />
                {:else}
                    <Badge
                        variant="secondary"
                        type={$user.emailVerification || $user.phoneVerification
                            ? 'success'
                            : undefined}
                        content={$user.emailVerification
                            ? 'verified '
                            : $user.phoneVerification
                              ? 'verified '
                              : 'unverified'} />
                {/if}
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        {#if $user.status}
            {#if $user.phone && $user.email}
                <DropList bind:show={showVerificationDropdown} placement="top-start">
                    <Button
                        secondary
                        on:click={() => (showVerificationDropdown = !showVerificationDropdown)}>
                        {$user.emailVerification && $user.phoneVerification ? 'Unverify' : 'Verify'}
                        account
                    </Button>
                    <svelte:fragment slot="list">
                        <DropListItem icon="mail" on:click={() => updateVerificationEmail()}>
                            {$user.emailVerification ? 'Unverify' : 'Verify'} email
                        </DropListItem>
                        <DropListItem icon="phone" on:click={() => updateVerificationPhone()}>
                            {$user.phoneVerification ? 'Unverify' : 'Verify'} phone
                        </DropListItem>
                    </svelte:fragment>
                </DropList>
            {:else if $user.email}
                <Button secondary on:click={() => updateVerificationEmail()}>
                    {$user.emailVerification ? 'Unverify' : 'Verify'} account
                </Button>
            {:else if $user.phone}
                <Button secondary on:click={() => updateVerificationPhone()}>
                    {$user.phoneVerification ? 'Unverify' : 'Verify'} account
                </Button>
            {/if}
        {/if}
        <Button text={$user.status} secondary={!$user.status} on:click={() => updateStatus()}>
            {$user.status ? 'Block account' : 'Unblock account'}
        </Button>
    </svelte:fragment>
</CardGrid>
