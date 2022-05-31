<script lang="ts">
    import { toLocaleDate } from '$lib/helpers/date';
    import { Avatar, Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, InputEmail, InputPassword, Helper } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import DeleteUser from './_deleteUser.svelte';

    import { user } from './store';

    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let userName = null;
    let userEmail = null;
    let repeatPassword = null;
    let newPassword = null;
    let newPref = false;
    let newKey = null;
    let newValue = null;

    const getAvatar = (name: string) =>
        sdkForProject.avatars.getInitials(name, 128, 128).toString();

    function addError(location: false | 'name' | 'email' | 'password', message: string, type) {
        showError = location;
        errorMessage = message;
        errorType = type;
        setTimeout(() => {
            showError = false;
        }, 6000);
    }

    async function updateVerification() {
        try {
            await sdkForProject.users.updateVerification($user.$id, !$user.emailVerification);
            $user.emailVerification = !$user.emailVerification;
            addNotification({
                message: `The account has been ${
                    $user.emailVerification ? 'verified' : 'unverified'
                }`,
                type: $user.emailVerification ? 'success' : 'info'
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
                type: `${$user.status ? 'success' : 'error'}`
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
            addNotification({
                message: 'Email has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('email', error.message, 'error');
        }
    }
    async function updatePassword() {
        if (newPassword === repeatPassword)
            try {
                await sdkForProject.users.updatePassword($user.$id, newPassword);
                $user.email = userEmail;
                addNotification({
                    message: 'Password has been updated',
                    type: 'success'
                });
            } catch (error) {
                addError('password', error.message, 'error');
            }
        else addError('password', "Passwords don't match", 'error');
    }

    async function updatePrefs() {
        try {
            let tmp = $user.prefs;
            tmp[newKey] = newValue;
            await sdkForProject.users.updatePrefs($user.$id, tmp);
            $user.prefs = tmp;
            newKey = null;
            newValue = null;
            addNotification({
                message: 'Preferences have been updated',
                type: 'success'
            });
        } catch (error) {
            addError('password', error.message, 'error');
        }
    }

    async function deletePref(selectedKey: string) {
        try {
            let tmp = $user.prefs;
            delete tmp[selectedKey];
            await sdkForProject.users.updatePrefs($user.$id, tmp);
            $user.prefs = tmp;
            addNotification({
                message: 'Preferences have been updated',
                type: 'success'
            });
        } catch (error) {
            addError('password', error.message, 'error');
        }
    }
</script>

<Container>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <div class="user-profile-button">
                <Avatar size={64} name={$user.name} src={getAvatar($user.name)} />
                <span class="user-profile-info">
                    <h6 class="heading-level-6">{$user.name}</h6>
                    <span class="title">{$user.email}</span>
                </span>
            </div>
            <div>
                {#if !$user.status}
                    <Pill danger>Blocked</Pill>
                {:else}
                    <Pill success={$user.emailVerification}
                        >{$user.emailVerification ? 'Verified' : 'Unverified'}</Pill>
                {/if}
                <p>Joined on {toLocaleDate($user.registration)}</p>
            </div>
        </div>
        <div class="u-flex u-main-space-end u-gap-12 common-section">
            <Button text on:click={() => updateStatus()}
                >{$user.status ? 'Block Account' : 'Unblock Accout'}</Button>
            {#if $user.status}
                <Button secondary on:click={() => updateVerification()}
                    >{$user.emailVerification ? 'Unverify' : 'Verify'} Account</Button>
            {/if}
        </div>
    </Card>
    <Card>
        newKey = null; newValue = null;
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <h6 class="heading-level-6">Update Name</h6>
            <ul>
                <InputText id="name" label="Name" placeholder={$user.name} bind:value={userName} />
                {#if showError === 'name'}
                    <Helper type={errorType}>{errorMessage}</Helper>
                {/if}
            </ul>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!userName}
                on:click={() => {
                    updateName();
                }}>Update</Button>
        </div>
    </Card>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <h6 class="heading-level-6">Update Email</h6>
            <ul>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder={$user.email}
                    bind:value={userEmail} />
                {#if showError === 'email'}
                    <Helper type={errorType}>{errorMessage}</Helper>
                {/if}
            </ul>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!userEmail}
                on:click={() => {
                    updateEmail();
                }}>Update</Button>
        </div>
    </Card>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <h6 class="heading-level-6">Update Password</h6>
            <ul>
                <InputPassword
                    id="newPassword"
                    label="New Password"
                    placeholder="Enter new password"
                    meter={false}
                    bind:value={newPassword} />
                <InputPassword
                    id="repeatPassword"
                    label="Repeat Password"
                    placeholder="Enter password again"
                    meter={false}
                    bind:value={repeatPassword} />
                {#if showError === 'password'}
                    <Helper type={errorType}>{errorMessage}</Helper>
                {/if}
            </ul>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!repeatPassword || !newPassword}
                on:click={() => {
                    updatePassword();
                }}>Update</Button>
        </div>
    </Card>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <div>
                <h6 class="heading-level-6">User Preferences</h6>
                <p>
                    You can update your user preferences by storing information on the user's
                    objects so they can easily be shared across devices and sessions.
                </p>
            </div>
            <div>
                {#each Object.entries($user.prefs) as [key, value]}
                    <ul class="u-flex u-gap-12">
                        <InputText id="key" label="Key" bind:value={key} />
                        <InputText id="value" label="Value" bind:value />
                        <Button text on:click={() => deletePref(key)}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </ul>
                {:else}
                    <ul class="u-flex u-gap-12">
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
                        <Button text disabled>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </ul>
                {/each}
                {#if newPref}
                    <ul class="u-flex u-gap-12">
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
                        <Button text on:click={() => (newPref = false)}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </ul>
                {/if}
                <Button text on:click={() => (newPref = true)}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text"> Add Preferences </span></Button>
            </div>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button disabled={!newKey || !newValue} on:click={() => updatePrefs()}>Update</Button>
        </div>
    </Card>

    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <div>
                <h6 class="heading-level-6">Danger Zone</h6>
                <p>
                    The user will be permanently deleted, including all data associated with this
                    user. This action is irreversible.
                </p>
            </div>
            <div>
                <div class="user-profile-button">
                    <Avatar size={64} name={$user.name} src={getAvatar($user.name)} />
                    <span class="user-profile-info">
                        <h6 class="heading-level-6">{$user.name}</h6>
                        <span class="title">{$user.email}</span>
                    </span>
                </div>
            </div>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </div>
    </Card>
</Container>

<DeleteUser bind:showDelete />
