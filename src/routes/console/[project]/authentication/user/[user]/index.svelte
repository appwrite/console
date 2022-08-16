<script lang="ts">
    import { page } from '$app/stores';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Avatar, CardGrid, Box, DropList, DropListItem } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        Button,
        InputText,
        InputEmail,
        InputPassword,
        InputPhone,
        Helper
    } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import DeleteUser from './_deleteUser.svelte';
    import { user } from './store';
    import { onMount } from 'svelte';
    import { title, breadcrumbs } from '$lib/stores/layout';

    $: if (prefs) {
        if (JSON.stringify(prefs) !== JSON.stringify(Object.entries($user.prefs))) {
            if (prefs[prefs.length - 1][0] && prefs[prefs.length - 1][1]) {
                arePrefsDisabled = false;
            }
        } else {
            arePrefsDisabled = true;
        }
    }
    let showDelete = false;
    let showError: false | 'name' | 'email' | 'phone' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let userName: string = null,
        userEmail: string = null,
        userPhone: string = null,
        newPassword: string = null;
    let prefs: [string, unknown][] = null;
    let arePrefsDisabled = true;
    let showVerifcationDropdown = false;

    onMount(async () => {
        await user.load($page.params.user);
        prefs = Object.entries($user.prefs);
        if (!prefs?.length) {
            prefs.push(['', '']);
        }
        userName ??= $user.name;
        userEmail ??= $user.email;
        userPhone ??= $user.phone;
    });

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 48, 48).toString();

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function updateVerificationEmail() {
        showVerifcationDropdown = false;
        try {
            await sdkForProject.users.updateEmailVerification($user.$id, !$user.emailVerification);
            $user.emailVerification = !$user.emailVerification;
            addNotification({
                message: `The account has been ${
                    $user.emailVerification ? 'verified' : 'unverified'
                }`,
                type: 'success'
            });
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
            $user.phoneVerification = !$user.phoneVerification;
            addNotification({
                message: `The account has been ${
                    $user.phoneVerification ? 'verified' : 'unverified'
                }`,
                type: 'success'
            });
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
            $user.status = !$user.status;
            addNotification({
                message: `The account has been ${$user.status ? 'unblocked' : 'blocked'}`,
                type: 'success'
            });
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
            $user.name = userName;
            title.set(userName);
            const breadcrumb = $breadcrumbs.get($breadcrumbs.size);
            breadcrumb.title = userName;
            $breadcrumbs = $breadcrumbs.set($breadcrumbs.size, breadcrumb);

            showError = false;
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('name', error.message, 'error');
        }
    }
    async function updateEmail() {
        try {
            await sdkForProject.users.updateEmail($user.$id, userEmail);
            $user.email = userEmail;
            showError = false;
            addNotification({
                message: 'Email has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('email', error.message, 'error');
        }
    }
    async function updatePhone() {
        try {
            await sdkForProject.users.updatePhone($user.$id, userPhone);
            $user.phone = userPhone;
            showError = false;
            addNotification({
                message: 'Phone has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('phone', error.message, 'error');
        }
    }
    async function updatePassword() {
        try {
            await sdkForProject.users.updatePassword($user.$id, newPassword);
            newPassword = null;
            showError = false;
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('password', error.message, 'error');
        }
    }

    async function updatePrefs() {
        try {
            let updatedPrefs = Object.fromEntries(prefs);

            await sdkForProject.users.updatePrefs($user.$id, updatedPrefs);
            $user.prefs = updatedPrefs;
            arePrefsDisabled = true;

            addNotification({
                message: 'Preferences have been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

{#if $user}
    <Container>
        <CardGrid>
            <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                <Avatar size={48} name={$user.name} src={getAvatar($user.name)} />
                <h6 class="heading-level-7">{$user.name}</h6>
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
                <Button
                    text={$user.status}
                    secondary={!$user.status}
                    on:click={() => updateStatus()}
                    >{$user.status ? 'Block account' : 'Unblock account'}</Button>
                {#if $user.status}
                    {#if $user.phone && $user.email}
                        <DropList
                            bind:show={showVerifcationDropdown}
                            position="top"
                            horizontal="left"
                            arrow={true}
                            arrowPosition="end">
                            <Button
                                secondary
                                on:click={() =>
                                    (showVerifcationDropdown = !showVerifcationDropdown)}>
                                {$user.emailVerification ? 'Unverify' : 'Verify'} account
                            </Button>
                            <svelte:fragment slot="list">
                                <DropListItem icon="mail" on:click={() => updateVerificationEmail()}
                                    >{$user.emailVerification ? 'Unverify' : 'Verify'} email</DropListItem>
                                <DropListItem
                                    icon="phone"
                                    on:click={() => updateVerificationPhone()}>
                                    {$user.phoneVerification ? 'Unverify' : 'Verify'} phone</DropListItem>
                            </svelte:fragment>
                        </DropList>
                    {:else if !$user.phone}
                        <Button secondary on:click={() => updateVerificationEmail()}>
                            {$user.emailVerification ? 'Unverify' : 'Verify'} account
                        </Button>
                    {:else if !$user.email}
                        <Button secondary on:click={() => updateVerificationPhone()}>
                            {$user.phoneVerification ? 'Unverify' : 'Verify'} account
                        </Button>{/if}
                {/if}
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autocomplete={false}
                        bind:value={userName} />
                    {#if showError === 'name'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={userName === $user.name || !userName}
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">Update Email</h6>
            <svelte:fragment slot="aside">
                <ul>
                    <InputEmail
                        id="email"
                        label="Email"
                        placeholder="Enter email"
                        autocomplete={false}
                        bind:value={userEmail} />
                    {#if showError === 'email'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={userEmail === $user.email || !userEmail}
                    on:click={() => {
                        updateEmail();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">Update Phone</h6>
            <svelte:fragment slot="aside">
                <ul>
                    <InputPhone
                        id="phone"
                        label="Phone"
                        placeholder="Enter phone number"
                        autocomplete={false}
                        bind:value={userPhone} />
                    {#if showError === 'phone'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={userPhone === $user.phone || !userPhone}
                    on:click={() => {
                        updatePhone();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <div>
                <h6 class="heading-level-7">Update Password</h6>
            </div>

            <p>
                Enter a new password. A password must contain <b> at least 8 characters.</b>
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
                    {#if showError === 'password'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={!newPassword}
                    on:click={() => {
                        updatePassword();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <h6 class="heading-level-7">User Preferences</h6>
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
                                        <label class="label" for={`value-${index}`}>Value</label>
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
                    <button
                        class="button is-text u-padding-inline-0"
                        disabled={prefs?.length
                            ? !prefs[prefs.length - 1][0] || !prefs[prefs.length - 1][1]
                            : true}
                        on:click={() => {
                            prefs.push(['', '']);
                            prefs = prefs;
                        }}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add preference </span></button>
                </form>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={arePrefsDisabled} on:click={() => updatePrefs()}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <div>
                <h6 class="heading-level-7">Danger Zone</h6>
            </div>
            <p>
                The user will be permanently deleted, including all data associated with this user.
                This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="image">
                        <Avatar size={48} name={$user.name} src={getAvatar($user.name)} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$user.name}</h6>
                    </svelte:fragment>
                    <p>{$user.email}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    </Container>
{/if}
<DeleteUser bind:showDelete />
