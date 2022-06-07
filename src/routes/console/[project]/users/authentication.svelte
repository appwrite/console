<script lang="ts">
    import { Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';
    import Auth from './_toggleOAuth.svelte';

    $: projectId = $project.$id;
    let showModal = false;

    const authUpdate = async (id: string, value: boolean) => {
        try {
            await sdkForConsole.projects.updateAuthStatus(projectId, id, value);
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
            value: $project.authEmailPassword
        },
        {
            label: 'Magic URL',
            id: 'magic-url',
            value: $project.authUsersAuthMagicURL
        },
        {
            label: 'Anonymous',
            id: 'anonymous',
            value: $project.authAnonymous
        },
        {
            label: 'Invites',
            id: 'invites',
            value: $project.authInvites
        },
        {
            label: 'JWT',
            id: 'jwt',
            value: $project.authJWT
        }
    ];

    let providers = [
        {
            name: 'Google',
            icon: 'google',
            active: false,
            id: $project.providerGoogleAppid,
            secret: $project.providerGoogleSecret
        },
        {
            name: 'Facebook',
            icon: 'facebook',
            active: false,
            id: $project.providerFacebookAppid,
            secret: $project.providerFacebookSecret
        },
        {
            name: 'Linkedin',
            icon: 'linkedin',
            active: false,
            id: $project.providerLinkedinAppid,
            secret: $project.providerLinkedinSecret
        },
        {
            name: 'Apple',
            icon: 'apple',
            active: false,
            id: $project.providerAppleAppid,
            secret: $project.providerAppleSecret
        },
        {
            name: 'Discord',
            icon: 'discord',
            active: false,
            id: $project.providerDiscordAppid,
            secret: $project.providerDiscordSecret
        },
        {
            name: 'Microsoft',
            icon: 'microsoft',
            active: false,
            id: $project.providerMicrosoftAppid,
            secret: $project.providerMicrosoftSecret
        },
        {
            name: 'Github',
            icon: 'github',
            active: false,
            id: $project.providerGithubAppid,
            secret: $project.providerGithubSecret
        },
        {
            name: 'Gitlab',
            icon: 'gitlab',
            active: false,
            id: $project.providerGitlabAppid,
            secret: $project.providerGitlabSecret
        },
        {
            name: 'Slack',
            icon: 'slack',
            active: false,
            id: $project.providerSlackAppid,
            secret: $project.providerSlackSecret
        },
        {
            name: 'Twitch',
            icon: 'twitch',
            active: false,
            id: $project.providerTwitchAppid,
            secret: $project.providerTwitchSecret
        },
        {
            name: 'Amazon',
            icon: 'amazon',
            active: false,
            id: $project.providerAmazonAppid,
            secret: $project.providerAmazonSecret
        },
        {
            name: 'Auth0',
            icon: 'auth0',
            active: false,
            id: $project.providerAuth0Appid,
            secret: $project.providerAuth0Secret
        },
        {
            name: 'Bitbucket',
            icon: 'bitBucket',
            active: false,
            id: $project.providerBitbucketAppid,
            secret: $project.providerBitbucketSecret
        },
        {
            name: 'Bitly',
            icon: 'bitly',
            active: false,
            id: $project.providerBitlyAppid,
            secret: $project.providerBitlySecret
        },
        {
            name: 'Box',
            icon: 'box',
            active: false,
            id: $project.providerBoxAppid,
            secret: $project.providerBoxSecret
        },
        {
            name: 'Dropbox',
            icon: 'dropbox',
            active: false,
            id: $project.providerDropboxAppid,
            secret: $project.providerDropboxSecret
        },
        {
            name: 'Mock',
            icon: 'mock',
            active: false,
            id: $project.providerMockAppid,
            secret: $project.providerMockSecret
        },
        {
            name: 'Notion',
            icon: 'notion',
            active: false,
            id: $project.providerNotionAppid,
            secret: $project.providerNotionSecret
        },
        {
            name: 'Okta',
            icon: 'okta',
            active: false,
            id: $project.providerOktaAppid,
            secret: $project.providerOktaSecret
        },
        {
            name: 'Paypal',
            icon: 'paypal',
            active: false,
            id: $project.providerPaypalAppid,
            secret: $project.providerPaypalSecret
        },
        {
            name: 'Salesforce',
            icon: 'salesforce',
            active: false,
            id: $project.providerSalesforceAppid,
            secret: $project.providerSalesforceSecret
        },
        {
            name: 'Spotify',
            icon: 'spotify',
            active: false,
            id: $project.providerSpotifyAppid,
            secret: $project.providerSpotifySecret
        },
        {
            name: 'Stripe',
            icon: 'stripe',
            active: false,
            id: $project.providerStripeAppid,
            secret: $project.providerStripeSecret
        },
        {
            name: 'Tradeshift',
            icon: 'tradeshift',
            active: false,
            id: $project.providerTradeshiftAppid,
            secret: $project.providerTradeshiftSecret
        },
        {
            name: 'Wordpress',
            icon: 'wordpress',
            active: false,
            id: $project.providerWordpressAppid,
            secret: $project.providerWordpressSecret
        },
        {
            name: 'Yahoo',
            icon: 'yahoo',
            active: false,
            id: $project.providerYahooAppid,
            secret: $project.providerYahooSecret
        },
        {
            name: 'Yammer',
            icon: 'ms_yammer',
            active: false,
            id: $project.providerYammerAppid,
            secret: $project.providerYammerSecret
        },
        {
            name: 'Yandex',
            icon: 'yandex',
            active: false,
            id: $project.providerYandexAppid,
            secret: $project.providerYandexSecret
        },
        {
            name: 'Zoom',
            icon: 'zoom',
            active: false,
            id: $project.providerZoomAppid,
            secret: $project.providerZoomSecret
        }
    ];

    let selectedProvider;

    //TODO: move authBoxes and providers to a store
    //TODO: if operation not successful revert switchbox value
</script>

<Container>
    <Card>
        <div>
            <h2 class="heading-level-6">Auth Methods</h2>
            <p>Enable the auth methods you wish to use.</p>
        </div>
        <ul class="">
            {#each authBoxes as box}
                <li class="form-item ">
                    <label class="label" for={box.id}>{box.label}</label>
                    <div class="input-text-wrapper">
                        <input
                            label={box.label}
                            id={box.id}
                            type="checkbox"
                            class="switch"
                            role="switch"
                            bind:checked={box.value}
                            on:change={() => {
                                authUpdate(box.id, box.value);
                            }} />
                    </div>
                </li>
            {/each}
            <li class="form-item ">
                <label class="label" for="Phone">Phone</label>
                <div class="input-text-wrapper">
                    <span>(soon)</span>
                </div>
            </li>
        </ul>
    </Card>
    <h2 class="heading-level-6 common-section">OAuth2 Providers</h2>
    <ul class="grid-box  common-section">
        {#each providers as provider}
            <button
                on:click={() => {
                    selectedProvider = provider;
                    showModal = true;
                }}
                class="card u-flex u-flex-vertical u-cross-center">
                <div class="card-image">
                    <img
                        height="50"
                        width="50"
                        src={`/icons/color/${provider.icon}.svg`}
                        alt={provider.name} />
                    <span class={`icon-${provider.icon}`} aria-hidden="true" />
                </div>
                <p>{provider.name}</p>
                <Pill success={provider.active}>{provider.active ? 'Active' : 'Inactive'}</Pill>
            </button>
        {/each}
    </ul>
</Container>

{#if selectedProvider}
    <Auth provider={selectedProvider} bind:showModal />
{/if}
