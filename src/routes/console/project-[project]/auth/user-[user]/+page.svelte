<script lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';
    import {
        CardGrid,
        Box,
        DropList,
        DropListItem,
        Heading,
        AvatarInitials
    } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        Button,
        Form,
        InputText,
        InputEmail,
        InputPassword,
        InputPhone
    } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import DeleteUser from './deleteUser.svelte';
    import { user } from './store';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';

    $: if (prefs) {
        if (JSON.stringify(prefs) !== JSON.stringify(Object.entries($user.prefs))) {
            if (!!prefs[prefs.length - 1][0] && !!prefs[prefs.length - 1][1]) {
                arePrefsDisabled = false;
            } else {
                arePrefsDisabled = true;
            }
        } else {
            arePrefsDisabled = true;
        }
    }

    let showDelete = false;
    let userName: string = null,
        userEmail: string = null,
        userPhone: string = null,
        newPassword: string = null;
    let prefs: [string, unknown][] = null;
    let arePrefsDisabled = true;
    let showVerifcationDropdown = false;

    onMount(async () => {
        prefs = Object.entries($user.prefs);
        if (!prefs?.length) {
            prefs.push(['', '']);
        }
        userName ??= $user.name;
        userEmail ??= $user.email;
        userPhone ??= $user.phone;
    });

    async function updateVerificationEmail() {
        showVerifcationDropdown = false;
        try {
            await sdkForProject.users.updateEmailVerification($user.$id, !$user.emailVerification);
            invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    $user.emailVerification ? 'verified' : 'unverified'
                }`,
                type: 'success'
            });
            trackEvent('submit_auth_user_update_verification_email');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateVerificationPhone() {
        showVerifcationDropdown = false;
        try {
            await sdkForProject.users.updatePhoneVerification($user.$id, !$user.phoneVerification);
            invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    $user.phoneVerification ? 'verified' : 'unverified'
                }`,
                type: 'success'
            });
            trackEvent('submit_auth_user_update_verification_phone');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateStatus() {
        try {
            await sdkForProject.users.updateStatus($user.$id, !$user.status);
            invalidate(Dependencies.USER);
            addNotification({
                message: `${$user.name || $user.email || $user.phone || 'The account'} has been ${
                    $user.status ? 'unblocked' : 'blocked'
                }`,
                type: 'success'
            });
            trackEvent('submit_auth_user_update_status');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateName() {
        try {
            await sdkForProject.users.updateName($user.$id, userName);
            invalidate(Dependencies.USER);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent('submit_auth_user_update_name');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateEmail() {
        try {
            await sdkForProject.users.updateEmail($user.$id, userEmail);
            invalidate(Dependencies.USER);
            addNotification({
                message: 'Email has been updated',
                type: 'success'
            });
            trackEvent('submit_auth_user_update_email');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updatePhone() {
        try {
            await sdkForProject.users.updatePhone($user.$id, userPhone);
            invalidate(Dependencies.USER);
            addNotification({
                message: 'Phone has been updated',
                type: 'success'
            });
            trackEvent('submit_auth_user_update_phone');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updatePassword() {
        try {
            await sdkForProject.users.updatePassword($user.$id, newPassword);
            newPassword = null;
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
            trackEvent('submit_auth_user_update_password');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updatePrefs() {
        try {
            let updatedPrefs = Object.fromEntries(prefs);

            await sdkForProject.users.updatePrefs($user.$id, updatedPrefs);
            invalidate(Dependencies.USER);
            arePrefsDisabled = true;

            addNotification({
                message: 'Preferences have been updated',
                type: 'success'
            });
            trackEvent('submit_auth_user_update_preferences');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Container>
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

    <Form on:submit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autocomplete={false}
                        bind:value={userName} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={userName === $user.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateEmail}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Email</Heading>
            <svelte:fragment slot="aside">
                <ul>
                    <InputEmail
                        id="email"
                        label="Email"
                        placeholder="Enter email"
                        autocomplete={false}
                        bind:value={userEmail} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={userEmail === $user.email} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updatePhone}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Phone</Heading>
            <svelte:fragment slot="aside">
                <ul>
                    <InputPhone
                        id="phone"
                        label="Phone"
                        placeholder="Enter phone number"
                        autocomplete={false}
                        bind:value={userPhone} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={userPhone === $user.phone} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updatePassword}>
        <CardGrid>
            <div>
                <Heading tag="h6" size="7">Update Password</Heading>
            </div>

            <p>
                Enter a new password. A password must contain <b>at least 8 characters.</b>
            </p>
            <svelte:fragment slot="aside">
                <ul>
                    <InputPassword
                        id="newPassword"
                        label="New Password"
                        placeholder="Enter new password"
                        autocomplete={false}
                        meter={false}
                        showPasswordButton={true}
                        bind:value={newPassword} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!newPassword} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updatePrefs}>
        <CardGrid>
            <Heading tag="h6" size="7">User Preferences</Heading>
            <p>
                You can update your user preferences by storing information on the user's objects so
                they can easily be shared across devices and sessions.
            </p>
            <svelte:fragment slot="aside">
                <form class="form u-grid u-gap-16">
                    <ul class="form-list">
                        {#if prefs}
                            {#each prefs as [key, value], index}
                                <li class="form-item is-multiple">
                                    <div class="form-item-part u-stretch">
                                        <label class="label" for={`key-${index}`}>Key</label>
                                        <div class="input-text-wrapper">
                                            <input
                                                id={`key-${key}`}
                                                placeholder="Enter key"
                                                type="text"
                                                class="input-text"
                                                bind:value={key} />
                                        </div>
                                    </div>
                                    <div class="form-item-part u-stretch">
                                        <label class="label" for={`value-${index}`}> Value </label>
                                        <div class="input-text-wrapper">
                                            <input
                                                id={`value-${value}`}
                                                placeholder="Enter value"
                                                type="text"
                                                class="input-text"
                                                bind:value />
                                        </div>
                                    </div>
                                    <div class="form-item-part u-cross-child-end">
                                        <Button
                                            text
                                            disabled={(!key || !value) && index === 0}
                                            on:click={() => {
                                                if (index === 0) {
                                                    prefs = [['', '']];
                                                } else {
                                                    prefs.splice(index, 1);
                                                    prefs = prefs;
                                                }
                                            }}>
                                            <span class="icon-x" aria-hidden="true" />
                                        </Button>
                                    </div>
                                </li>
                            {/each}
                        {/if}
                    </ul>
                    <Button
                        noMargin
                        text
                        on:click={() => {
                            if (prefs[prefs.length - 1][0] && prefs[prefs.length - 1][1]) {
                                prefs.push(['', '']);
                                prefs = prefs;
                            }
                        }}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Add Preference</span>
                    </Button>
                </form>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={arePrefsDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Danger Zone</Heading>
        </div>
        <p>
            The user will be permanently deleted, including all data associated with this user. This
            action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="image">
                    {#if $user.email || $user.phone}
                        {#if $user.name}
                            <AvatarInitials size={48} name={$user.name} />
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
                </svelte:fragment>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">
                        {$user.name || $user.email || $user.phone || 'Anonymous'}
                    </h6>
                </svelte:fragment>
                <p class="u-trim-1">
                    {$user.email && $user.phone
                        ? [$user.email, $user.phone].join(',')
                        : $user.email || $user.phone}
                </p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)} event="delete_user"
                >Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<DeleteUser bind:showDelete />
