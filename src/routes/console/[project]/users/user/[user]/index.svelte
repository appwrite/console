<script lang="ts">
    import { page } from '$app/stores';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Avatar, CardGrid, Box } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, InputEmail, InputPassword, Helper } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import DeleteUser from './_deleteUser.svelte';
    import { user } from './store';
    import { onMount } from 'svelte';

    $: if (newKey && newValue) {
        arePrefsDisabled = false;
    } else if (prefs) {
        if (JSON.stringify(prefs) !== JSON.stringify(Object.entries($user.response.prefs))) {
            arePrefsDisabled = false;
        }
    }
    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let userName = null,
        userEmail = null,
        newPassword = null,
        newPref = false,
        newKey = null,
        newValue = null;
    let prefs = null;
    let arePrefsDisabled = true;

    onMount(async () => {
        await user.load($page.params.user);
        prefs = Object.entries($user.response.prefs);
    });

    const getAvatar = (name: string) =>
        sdkForProject.avatars.getInitials(name, 128, 128).toString();

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function updateVerification() {
        try {
            await sdkForProject.users.updateVerification(
                $user.response.$id,
                !$user.response.emailVerification
            );
            $user.response.emailVerification = !$user.response.emailVerification;
            addNotification({
                message: `The account has been ${
                    $user.response.emailVerification ? 'verified' : 'unverified'
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
            await sdkForProject.users.updateStatus($user.response.$id, !$user.response.status);
            $user.response.status = !$user.response.status;
            addNotification({
                message: `The account has been ${$user.response.status ? 'unblocked' : 'blocked'}`,
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
            await sdkForProject.users.updateName($user.response.$id, userName);
            $user.response.name = userName;
            userName = null;
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
            await sdkForProject.users.updateEmail($user.response.$id, userEmail);
            $user.response.email = userEmail;
            userEmail = null;
            showError = false;
            addNotification({
                message: 'Email has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('email', error.message, 'error');
        }
    }
    async function updatePassword() {
        try {
            await sdkForProject.users.updatePassword($user.response.$id, newPassword);
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
            if (newKey && newValue) {
                updatedPrefs[newKey] = newValue;
                prefs = Object.entries(updatedPrefs);
                newKey = null;
                newValue = null;
            }
            newPref = null;
            await sdkForProject.users.updatePrefs($user.response.$id, updatedPrefs);
            $user.response.prefs = updatedPrefs;
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

    async function deletePref(selectedKey: string) {
        try {
            let updatedPrefs = Object.fromEntries(prefs);
            delete updatedPrefs[selectedKey];
            await sdkForProject.users.updatePrefs($user.response.$id, updatedPrefs);
            prefs = Object.entries(updatedPrefs);
            $user.response.prefs = updatedPrefs;
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

<Container>
    <CardGrid>
        <svelte:fragment slot="left">
            <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                <Avatar size={64} name={$user.response.name} src={getAvatar($user.response.name)} />
                <h6 class="heading-level-7">{$user.response.name}</h6>
                {#if !$user.response.status}
                    <Pill danger>Blocked</Pill>
                {:else}
                    <Pill success={$user.response.emailVerification}
                        >{$user.response.emailVerification ? 'Verified' : 'Unverified'}</Pill>
                {/if}
            </div>
        </svelte:fragment>
        <svelte:fragment slot="right">
            <div>
                <span class="title">{$user.response.email}</span>
                <p>Joined: {toLocaleDate($user.response.registration)}</p>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                text={$user.response.status}
                secondary={!$user.response.status}
                on:click={() => updateStatus()}
                >{$user.response.status ? 'Block Account' : 'Unblock Accout'}</Button>
            {#if $user.response.status}
                <Button secondary on:click={() => updateVerification()}
                    >{$user.response.emailVerification ? 'Unverify' : 'Verify'} Account</Button>
            {/if}
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="left">
            <h6 class="heading-level-7">Update Name</h6>
        </svelte:fragment>

        <svelte:fragment slot="right">
            <ul>
                <InputText
                    id="name"
                    label="Name"
                    placeholder={$user.response.name}
                    autocomplete={false}
                    bind:value={userName} />
                {#if showError === 'name'}
                    <Helper type={errorType}>{errorMessage}</Helper>
                {/if}
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={!userName}
                on:click={() => {
                    updateName();
                }}>Update</Button>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="left">
            <h6 class="heading-level-7">Update Email</h6>
        </svelte:fragment>
        <svelte:fragment slot="right">
            <ul>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder={$user.response.email}
                    autocomplete={false}
                    bind:value={userEmail} />
                {#if showError === 'email'}
                    <Helper type={errorType}>{errorMessage}</Helper>
                {/if}
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={!userEmail}
                on:click={() => {
                    updateEmail();
                }}>Update</Button>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="left">
            <div>
                <h6 class="heading-level-7">Update Password</h6>
            </div>

            <p>
                Enter a new password. A password must contain <b> at least 8 characters.</b>
            </p>
        </svelte:fragment>
        <svelte:fragment slot="right">
            <ul>
                <InputPassword
                    id="newPassword"
                    label="New Password"
                    placeholder="Enter new password"
                    autocomplete={false}
                    meter={false}
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
        <svelte:fragment slot="left">
            <h6 class="heading-level-7">User Preferences</h6>
            <p>
                You can update your user preferences by storing information on the user's objects so
                they can easily be shared across devices and sessions.
            </p>
        </svelte:fragment>
        <svelte:fragment slot="right">
            <form class="form u-grid u-gap-16">
                <ul class="form-list">
                    {#if prefs}
                        {#each prefs as [key, value]}
                            <li class="form-item is-multiple">
                                <InputText id={`key-${key}`} label="Key" bind:value={key} />
                                <InputText id={`value-${value}`} label="Value" bind:value />
                                <div class="form-item-part u-cross-child-end">
                                    <Button text on:click={() => deletePref(key)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {/each}
                        {#if prefs.length === 0 || newPref}
                            <li class="form-item is-multiple">
                                <InputText
                                    id="key"
                                    label="Key"
                                    placeholder="Enter Key"
                                    bind:value={newKey} />
                                <InputText
                                    id="value"
                                    label="Value"
                                    placeholder="Enter Value"
                                    bind:value={newValue} />
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        disabled={!prefs.length}
                                        on:click={() => (newPref = false)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {/if}
                    {/if}
                </ul>
                <Button text on:click={() => (newPref = true)}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text"> Add Preferences </span></Button>
            </form>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePrefsDisabled} on:click={() => updatePrefs()}>Update</Button>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <svelte:fragment slot="left">
            <div>
                <h6 class="heading-level-7">Danger Zone</h6>
            </div>
            <p>
                The user will be permanently deleted, including all data associated with this user.
                This action is irreversible.
            </p>
        </svelte:fragment>
        <svelte:fragment slot="right">
            <Box>
                <svelte:fragment slot="image">
                    <Avatar
                        size={64}
                        name={$user.response.name}
                        src={getAvatar($user.response.name)} />
                </svelte:fragment>
                <svelte:fragment slot="title">
                    <h6 class="u-bold">{$user.response.name}</h6>
                </svelte:fragment>
                <p>{$user.response.email}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<DeleteUser bind:showDelete />
