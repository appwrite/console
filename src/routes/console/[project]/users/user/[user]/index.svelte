<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Avatar, Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from './store';

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
</script>

<Container>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <div class="user-profile-button">
                <Avatar
                    size={50}
                    name={$user.name}
                    src={sdkForConsole.avatars.getInitials($user.name, 50, 50).toString()} />
                <span class="user-profile-info">
                    <h6 class="heading-level-6">{$user.name}</h6>
                    <span class="title">{$user.email}</span>
                </span>
            </div>
            <div>
                <Pill>{$user.emailVerification ? 'Verified' : 'Unverified'}</Pill>
                <p>Joined on {toLocaleDate($user.registration)}</p>
            </div>
        </div>
        <div class="u-flex u-main-space-end u-gap-12 common-section">
            <Button text>Block Account</Button>
            <Button secondary>Verify Account</Button>
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
                    <Avatar
                        size={50}
                        name={$user.name}
                        src={sdkForConsole.avatars.getInitials($user.name, 50, 50).toString()} />
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
