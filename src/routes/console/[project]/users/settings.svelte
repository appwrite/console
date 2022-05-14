<script lang="ts">
    import { SwitchBoxes } from '$lib/components';
    import { Container } from '$lib/layout';
    import Toggle from './_toggleOAuth.svelte';
    import SetUserLimit from './_setUserLimit.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';

    let showModal = false;
    let showUserLimitModal = false;
    const projectId = $project.$id;
    let provider: string;
    let authLimit = $project.authLimit;

    const authUpdate = async (event) => {
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

    const providerUpdate = async (event) => {
        provider = event.detail.id;
        showModal = true;
    };

    let authBoxes = [
        {
            label: 'Email/Password',
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

    let providersBoxes = [
        {
            label: 'Amazon',
            id: 'amazon',
            href: 'https://developer.amazon.com/apps-and-games/services-and-apis',
            linkText: 'OAuth2 Docs'
        },
        {
            label: 'Apple',
            id: 'apple',
            href: 'https://developer.amazon.com/apps-and-games/services-and-apis',
            linkText: 'OAuth2 Docs'
        },
        {
            label: 'BitBucket',
            id: 'bitbucket',
            href: 'https://developer.amazon.com/apps-and-games/services-and-apis',
            linkText: 'OAuth2 Docs'
        }
    ];

    //TODO: move authBoxes and providersBoxes to a store
    //TODO: if operation not successful revert switchbox value
</script>

<Container>
    <p>
        {authLimit ? `${authLimit} Users allowed` : 'Unlimited Users '}
        <button
            on:click={() => {
                showUserLimitModal = true;
            }}
            class=" is-text link"
            ><span class="text">{authLimit ? 'Change Limit' : 'Set Limit'}</span></button>
    </p>
    <h2>Settings</h2>
    <p>Choose auth methods you wish to use.</p>
    <SwitchBoxes boxes={authBoxes} on:updated={authUpdate} />
    <h3>OAuth2 Providers</h3>
    <SwitchBoxes boxes={providersBoxes} on:updated={providerUpdate} />
</Container>

{#if provider && showModal}
    <Toggle {provider} bind:showModal />
{/if}

<SetUserLimit bind:authLimit bind:showUserLimitModal />
