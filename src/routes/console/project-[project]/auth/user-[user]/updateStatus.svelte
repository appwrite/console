<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { AvatarInitials, CardGrid, DropList, DropListItem, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from './store';

    let showVerifcationDropdown = false;

    async function updateVerificationEmail() {
        showVerifcationDropdown = false;
        try {
            await sdkForProject.users.updateEmailVerification($user.$id, !$user.emailVerification);
            invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    $user.emailVerification ? 'unverified' : 'verified'
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
        showVerifcationDropdown = false;
        try {
            await sdkForProject.users.updatePhoneVerification($user.$id, !$user.phoneVerification);
            invalidate(Dependencies.USER);
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
            await sdkForProject.users.updateStatus($user.$id, !$user.status);
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
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
        {#if $user.email || $user.phone}
            {#if $user.name}
                <AvatarInitials size={48} name={$user.name} />
                <Heading tag="h6" size="7">{$user.name}</Heading>
            {:else}
                <div class="avatar">
                    <span class="icon-minus-sm" aria-hidden="true" />
                </div>
            {/if}
        {:else}
            <div class="avatar">
                <span class="icon-anonymous" aria-hidden="true" />
            </div>
        {/if}
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div>
                {#if $user.email}
                    <p class="title">{$user.email}</p>
                {/if}
                {#if $user.phone}
                    <p class="title">{$user.phone}</p>
                {/if}
                <p>Joined: {toLocaleDateTime($user.registration)}</p>
            </div>
            {#if !$user.status}
                <Pill danger>blocked</Pill>
            {:else if $user.email && $user.phone}
                <Pill success={$user.emailVerification || $user.phoneVerification}>
                    {$user.emailVerification && $user.phoneVerification
                        ? 'verified'
                        : $user.emailVerification
                        ? 'verified email'
                        : $user.phoneVerification
                        ? 'verified phone'
                        : 'unverified'}
                </Pill>
            {:else}
                <Pill success={$user.emailVerification || $user.phoneVerification}>
                    {$user.emailVerification
                        ? 'verified '
                        : $user.phoneVerification
                        ? 'verified '
                        : 'unverified'}
                </Pill>
            {/if}
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button text={$user.status} secondary={!$user.status} on:click={() => updateStatus()}>
            {$user.status ? 'Block account' : 'Unblock account'}
        </Button>
        {#if $user.status}
            {#if $user.phone && $user.email}
                <DropList bind:show={showVerifcationDropdown} placement="top-start">
                    <Button
                        secondary
                        on:click={() => (showVerifcationDropdown = !showVerifcationDropdown)}>
                        {$user.emailVerification ? 'Unverify' : 'Verify'} account
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
    </svelte:fragment>
</CardGrid>
