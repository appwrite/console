<script lang="ts">
    import { SwitchBoxes } from '$lib/components';
    import { Container } from '$lib/layout';
    import SetUserLimit from './_setUserLimit.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';

    $: authLimit = $project.authLimit;
    $: projectId = $project.$id;
    let showUserLimitModal = false;

    const authUpdate = async (event: CustomEvent) => {
        try {
            await sdkForConsole.projects.updateAuthStatus(
                projectId,
                event.detail.id,
                event.detail.value
            );
            addNotification({
                type: 'success',
                message: 'Updated project auth status successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    let authBoxes = [
        {
            label: 'Password',
            id: 'email-password',
            href: 'https://appwrite.io/docs/client/account?sdk=web-default#accountCreateSession',
            value: $project.authEmailPassword
        },
        {
            label: 'Magic URL',
            id: 'magic-url',
            href: 'https://appwrite.io/docs/client/account?sdk=web-default#accountCreateMagicURLSession',
            value: $project.authUsersAuthMagicURL
        },
        {
            label: 'Anonymous',
            id: 'anonymous',
            href: 'https://appwrite.io/docs/client/account?sdk=web-default#accountCreateAnonymousSession',
            value: $project.authAnonymous
        },
        {
            label: 'Invites',
            id: 'invites',
            href: 'https://appwrite.io/docs/client/teams?sdk=web-default#teamsCreateMembership',
            value: $project.authInvites
        },
        {
            label: 'JWT',
            id: 'jwt',
            href: 'https://appwrite.io/docs/client/account?sdk=web-default#accountCreateJWT',
            value: $project.authJWT
        },
        {
            label: 'Phone (soon)',
            id: 'phone',
            value: false,
            wip: true
        }
    ];
    //TODO: move authBoxes and providersBoxes to a store
    //TODO: if operation not successful revert switchbox value
</script>

<Container>
    <p>
        {authLimit ? `${authLimit} Users allowed` : 'Unlimited Users'}
        <button on:click={() => (showUserLimitModal = true)} class=" is-text link">
            <span class="text">{authLimit ? 'Change Limit' : 'Set Limit'}</span>
        </button>
    </p>
    <p>Choose auth methods you wish to use.</p>
    <SwitchBoxes boxes={authBoxes} on:updated={authUpdate} />
</Container>

<SetUserLimit {authLimit} bind:showUserLimitModal />
