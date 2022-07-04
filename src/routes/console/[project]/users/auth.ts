import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import type { SvelteComponent } from 'svelte';
import Apple from './_appleOAuth.svelte';
import Microsoft from './_microsoftOAuth.svelte';
import Okta from './_oktaOAuth.svelte';
import Auth0 from './_auth0OAuth.svelte';
import Main from './_mainOAuth.svelte';

export type Provider = {
    name: string;
    icon: string;
    active: boolean;
    id: string | null;
    secret: string | null;
    docs?: string;
    component?: typeof SvelteComponent;
};

export type Providers = {
    providers: Provider[];
};

function createOAuthProviders() {
    const { subscribe, set } = writable<Providers>({
        providers: [
            {
                name: 'Amazon',
                icon: 'amazon',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.amazon.com/apps-and-games/services-and-apis',
                component: Main
            },
            {
                name: 'Apple',
                icon: 'apple',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.apple.com/',
                component: Apple
            },
            {
                name: 'Auth0',
                icon: 'auth0',
                active: false,
                id: null,
                secret: null,
                docs: 'https://auth0.com/developers',
                component: Auth0
            },
            {
                name: 'Bitbucket',
                icon: 'bitBucket',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.atlassian.com/bitbucket',
                component: Main
            },
            {
                name: 'Bitly',
                icon: 'bitly',
                active: false,
                id: null,
                secret: null,
                docs: 'https://dev.bitly.com/v4_documentation.html',
                component: Main
            },
            {
                name: 'Box',
                icon: 'box',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.box.com/reference/',
                component: Main
            },
            {
                name: 'Discord',
                icon: 'discord',
                active: false,
                id: null,
                secret: null,
                docs: 'https://discordapp.com/developers/docs/topics/oauth2',
                component: Main
            },
            {
                name: 'Dropbox',
                icon: 'dropbox',
                active: false,
                id: null,
                secret: null,
                docs: 'https://www.dropbox.com/developers/documentation',
                component: Main
            },
            {
                name: 'Facebook',
                icon: 'facebook',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developers.facebook.com/',
                component: Main
            },
            {
                name: 'Github',
                icon: 'github',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.github.com/',
                component: Main
            },
            {
                name: 'Gitlab',
                icon: 'gitlab',
                active: false,
                id: null,
                secret: null,
                docs: 'https://docs.gitlab.com/ee/api/',
                component: Main
            },
            {
                name: 'Google',
                icon: 'google',
                active: false,
                id: null,
                secret: null,
                docs: 'https://support.google.com/googleapi/answer/6158849',
                component: Main
            },
            {
                name: 'Linkedin',
                icon: 'linkedin',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.linkedin.com/',
                component: Main
            },
            {
                name: 'Microsoft',
                icon: 'microsoft',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.microsoft.com/en-us/',
                component: Microsoft
            },
            {
                name: 'Notion',
                icon: 'notion',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developers.notion.com/docs',
                component: Main
            },
            {
                name: 'Okta',
                icon: 'okta',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.okta.com/',
                component: Okta
            },
            {
                name: 'Paypal',
                icon: 'paypal',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.paypal.com/docs/api/overview/',
                component: Main
            },
            {
                name: 'Paypal (sandbox)',
                icon: 'paypal',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.paypal.com/docs/api/overview/',
                component: Main
            },
            {
                name: 'Salesforce',
                icon: 'salesforce',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.salesforce.com/docs/',
                component: Main
            },
            {
                name: 'Slack',
                icon: 'slack',
                active: false,
                id: null,
                secret: null,
                docs: 'https://api.slack.com/',
                component: Main
            },
            {
                name: 'Spotify',
                icon: 'spotify',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.spotify.com/documentation/general/guides/authorization-guide/',
                component: Main
            },
            {
                name: 'Stripe',
                icon: 'stripe',
                active: false,
                id: null,
                secret: null,
                docs: 'https://stripe.com/docs/api',
                component: Main
            },
            {
                name: 'Tradeshift',
                icon: 'tradeshift',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developers.tradeshift.com/docs/api',
                component: Main
            },
            {
                name: 'Tradeshift(sandbox)',
                icon: 'tradeshift',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developers.tradeshift.com/docs/api',
                component: Main
            },
            {
                name: 'Twitch',
                icon: 'twitch',
                active: false,
                id: null,
                secret: null,
                docs: 'https://dev.twitch.tv/docs/authentication',
                component: Main
            },

            {
                name: 'Wordpress',
                icon: 'wordpress',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.wordpress.com/docs/oauth2/',
                component: Main
            },
            {
                name: 'Yahoo',
                icon: 'yahoo',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.yahoo.com/oauth2/guide/flows_authcode/',
                component: Main
            },
            {
                name: 'Yammer',
                icon: 'ms_yammer',
                active: false,
                id: null,
                secret: null,
                docs: 'https://developer.yammer.com/docs/oauth-2',
                component: Main
            },
            {
                name: 'Yandex',
                icon: 'yandex',
                active: false,
                id: null,
                secret: null,
                docs: 'https://tech.yandex.com/oauth/',
                component: Main
            },
            {
                name: 'Zoom',
                icon: 'zoom',
                active: false,
                id: null,
                secret: null,
                docs: 'https://marketplace.zoom.us/docs/guides/auth/oauth/',
                component: Main
            }
        ]
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            const providers: Provider[] = [
                {
                    name: 'Amazon',
                    icon: 'amazon',
                    active: false,
                    id: project.providerAmazonAppid,
                    secret: project.providerAmazonSecret,
                    docs: 'https://developer.amazon.com/apps-and-games/services-and-apis',
                    component: Main
                },
                {
                    name: 'Apple',
                    icon: 'apple',
                    active: false,
                    id: project.providerAppleAppid,
                    secret: project.providerAppleSecret,
                    docs: 'https://developer.apple.com/',
                    component: Apple
                },
                {
                    name: 'Auth0',
                    icon: 'auth0',
                    active: false,
                    id: project.providerAuth0Appid,
                    secret: project.providerAuth0Secret,
                    docs: 'https://auth0.com/developers',
                    component: Auth0
                },
                {
                    name: 'Bitbucket',
                    icon: 'bitBucket',
                    active: false,
                    id: project.providerBitbucketAppid,
                    secret: project.providerBitbucketSecret,
                    docs: 'https://developer.atlassian.com/bitbucket',
                    component: Main
                },
                {
                    name: 'Bitly',
                    icon: 'bitly',
                    active: false,
                    id: project.providerBitlyAppid,
                    secret: project.providerBitlySecret,
                    docs: 'https://dev.bitly.com/v4_documentation.html',
                    component: Main
                },
                {
                    name: 'Box',
                    icon: 'box',
                    active: false,
                    id: project.providerBoxAppid,
                    secret: project.providerBoxSecret,
                    docs: 'https://developer.box.com/reference/',
                    component: Main
                },
                {
                    name: 'Discord',
                    icon: 'discord',
                    active: false,
                    id: project.providerDiscordAppid,
                    secret: project.providerDiscordSecret,
                    docs: 'https://discordapp.com/developers/docs/topics/oauth2',
                    component: Main
                },
                {
                    name: 'Dropbox',
                    icon: 'dropbox',
                    active: false,
                    id: project.providerDropboxAppid,
                    secret: project.providerDropboxSecret,
                    docs: 'https://www.dropbox.com/developers/documentation',
                    component: Main
                },
                {
                    name: 'Facebook',
                    icon: 'facebook',
                    active: false,
                    id: project.providerFacebookAppid,
                    secret: project.providerFacebookSecret,
                    docs: 'https://developers.facebook.com/',
                    component: Main
                },
                {
                    name: 'Github',
                    icon: 'github',
                    active: false,
                    id: project.providerGithubAppid,
                    secret: project.providerGithubSecret,
                    docs: 'https://developer.github.com/',
                    component: Main
                },
                {
                    name: 'Gitlab',
                    icon: 'gitlab',
                    active: false,
                    id: project.providerGitlabAppid,
                    secret: project.providerGitlabSecret,
                    docs: 'https://docs.gitlab.com/ee/api/',
                    component: Main
                },
                {
                    name: 'Google',
                    icon: 'google',
                    active: false,
                    id: project.providerGoogleAppid,
                    secret: project.providerGoogleSecret,
                    docs: 'https://support.google.com/googleapi/answer/6158849',
                    component: Main
                },
                {
                    name: 'Linkedin',
                    icon: 'linkedin',
                    active: false,
                    id: project.providerLinkedinAppid,
                    secret: project.providerLinkedinSecret,
                    docs: 'https://developer.linkedin.com/',
                    component: Main
                },
                {
                    name: 'Microsoft',
                    icon: 'microsoft',
                    active: false,
                    id: project.providerMicrosoftAppid,
                    secret: project.providerMicrosoftSecret,
                    docs: 'https://developer.microsoft.com/en-us/',
                    component: Microsoft
                },
                {
                    name: 'Notion',
                    icon: 'notion',
                    active: false,
                    id: project.providerNotionAppid,
                    secret: project.providerNotionSecret,
                    docs: 'https://developers.notion.com/docs',
                    component: Main
                },
                {
                    name: 'Okta',
                    icon: 'okta',
                    active: false,
                    id: project.providerOktaAppid,
                    secret: project.providerOktaSecret,
                    docs: 'https://developer.okta.com/',
                    component: Okta
                },
                {
                    name: 'Paypal',
                    icon: 'paypal',
                    active: false,
                    id: project.providerPaypalAppid,
                    secret: project.providerPaypalSecret,
                    docs: 'https://developer.paypal.com/docs/api/overview/',
                    component: Main
                },
                {
                    name: 'Paypal (sandbox)',
                    icon: 'paypal',
                    active: false,
                    id: project.providerPaypalSandboxAppid,
                    secret: project.providerPaypalSandboxSecret,
                    docs: 'https://developer.paypal.com/docs/api/overview/',
                    component: Main
                },
                {
                    name: 'Salesforce',
                    icon: 'salesforce',
                    active: false,
                    id: project.providerSalesforceAppid,
                    secret: project.providerSalesforceSecret,
                    docs: 'https://developer.salesforce.com/docs/',
                    component: Main
                },
                {
                    name: 'Slack',
                    icon: 'slack',
                    active: false,
                    id: project.providerSlackAppid,
                    secret: project.providerSlackSecret,
                    docs: 'https://api.slack.com/',
                    component: Main
                },
                {
                    name: 'Spotify',
                    icon: 'spotify',
                    active: false,
                    id: project.providerSpotifyAppid,
                    secret: project.providerSpotifySecret,
                    docs: 'https://developer.spotify.com/documentation/general/guides/authorization-guide/',
                    component: Main
                },
                {
                    name: 'Stripe',
                    icon: 'stripe',
                    active: false,
                    id: project.providerStripeAppid,
                    secret: project.providerStripeSecret,
                    docs: 'https://stripe.com/docs/api',
                    component: Main
                },
                {
                    name: 'Tradeshift',
                    icon: 'tradeshift',
                    active: false,
                    id: project.providerTradeshiftAppid,
                    secret: project.providerTradeshiftSecret,
                    docs: 'https://developers.tradeshift.com/docs/api',
                    component: Main
                },
                {
                    name: 'Tradeshift(sandbox)',
                    icon: 'tradeshift',
                    active: false,
                    id: project.providerTradeshiftBoxAppid,
                    secret: project.providerTradeshiftBoxSecret,
                    docs: 'https://developers.tradeshift.com/docs/api',
                    component: Main
                },
                {
                    name: 'Twitch',
                    icon: 'twitch',
                    active: false,
                    id: project.providerTwitchAppid,
                    secret: project.providerTwitchSecret,
                    docs: 'https://dev.twitch.tv/docs/authentication',
                    component: Main
                },

                {
                    name: 'Wordpress',
                    icon: 'wordpress',
                    active: false,
                    id: project.providerWordpressAppid,
                    secret: project.providerWordpressSecret,
                    docs: 'https://developer.wordpress.com/docs/oauth2/',
                    component: Main
                },
                {
                    name: 'Yahoo',
                    icon: 'yahoo',
                    active: false,
                    id: project.providerYahooAppid,
                    secret: project.providerYahooSecret,
                    docs: 'https://developer.yahoo.com/oauth2/guide/flows_authcode/',
                    component: Main
                },
                {
                    name: 'Yammer',
                    icon: 'ms_yammer',
                    active: false,
                    id: project.providerYammerAppid,
                    secret: project.providerYammerSecret,
                    docs: 'https://developer.yammer.com/docs/oauth-2',
                    component: Main
                },
                {
                    name: 'Yandex',
                    icon: 'yandex',
                    active: false,
                    id: project.providerYandexAppid,
                    secret: project.providerYandexSecret,
                    docs: 'https://tech.yandex.com/oauth/',
                    component: Main
                },
                {
                    name: 'Zoom',
                    icon: 'zoom',
                    active: false,
                    id: project.providerZoomAppid,
                    secret: project.providerZoomSecret,
                    docs: 'https://marketplace.zoom.us/docs/guides/auth/oauth/',
                    component: Main
                }
            ];
            set({ providers });
        }
    };
}

export const OAuthProviders = createOAuthProviders();
