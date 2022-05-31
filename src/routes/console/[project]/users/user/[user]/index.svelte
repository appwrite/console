<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Avatar, Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, InputEmail, InputPassword } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { user } from './store';

    let userName = null;
    let userEmail = null;
    let oldPw = null;
    let newPw = null;

    const getAvatar = (name: string) =>
        sdkForProject.avatars.getInitials(name, 128, 128).toString();

    const deleteUser = async (id: string) => {
        try {
            if (!confirm('Are you sure you want to delete that user?')) return;
            await sdkForProject.users.delete(id);
            await goto(`${base}/console/${$page.params.project}/users`);
        } catch (error) {
            console.error(error);
        }
    };

    async function updateVerification() {
        try {
            await sdkForProject.users.updateVerification($user.$id, true);
            $user.emailVerification = true;
            addNotification({
                message: 'The account has been verified',
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
                message: `The account has been ${$user.status ? 'unlocked' : 'blocked'}`,
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
            addNotification({
                message: error.message,
                type: 'error'
            });
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
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updatePassword() {
        try {
            await sdkForProject.users.updatePassword($user.$id, newPw);
            $user.email = userEmail;
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    console.log($user);
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
                {/if}

                <Pill success={$user.emailVerification}
                    >{$user.emailVerification ? 'Verified' : 'Unverified'}</Pill>
                <p>Joined on {toLocaleDate($user.registration)}</p>
            </div>
        </div>
        <div class="u-flex u-main-space-end u-gap-12 common-section">
            <Button text on:click={() => updateStatus()}
                >{$user.status ? 'Block Account' : 'Unlock Accout'}</Button>
            <Button
                secondary
                disabled={$user.emailVerification}
                on:click={() => updateVerification()}>Verify Account</Button>
        </div>
    </Card>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <h6 class="heading-level-6">Update Name</h6>
            <ul>
                <InputText id="name" label="Name" placeholder={$user.name} bind:value={userName} />
            </ul>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!userName}
                secondary
                on:click={() => {
                    updateName();
                }}>Update</Button>
        </div>
    </Card>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <h6 class="heading-level-6">Update Email</h6>
            <InputEmail id="email" label="Email" placeholder={$user.email} bind:value={userEmail} />
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!userEmail}
                secondary
                on:click={() => {
                    updateEmail();
                }}>Update</Button>
        </div>
    </Card>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <h6 class="heading-level-6">Update Password</h6>
            <div class="">
                <InputPassword
                    id="oldpw"
                    label="Old Password"
                    placeholder="Enter old password"
                    bind:value={oldPw} />
                <InputPassword
                    id="newpw"
                    label="New Password"
                    placeholder="Enter new password"
                    bind:value={newPw} />
            </div>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!oldPw || !newPw}
                secondary
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
                    <p>{key}: {value}</p>
                {:else}
                    No user preferences found.
                {/each}
            </div>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button secondary>Update</Button>
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
            <!-- <Button secondary on:click={() => deleteUser($user.$id)}>Delete</Button> -->
            <Button secondary on:click={() => console.log('open modal')}>Delete</Button>
        </div>
    </Card>
</Container>
