import Apple from '$routes/(console)/project-[project]/auth/(providers)/appleOAuth.svelte';
import Auth0 from '$routes/(console)/project-[project]/auth/(providers)/auth0OAuth.svelte';
import Authentik from '$routes/(console)/project-[project]/auth/(providers)/authentikOAuth.svelte';
import GitLab from '$routes/(console)/project-[project]/auth/(providers)/gitlabOAuth.svelte';
import Google from '$routes/(console)/project-[project]/auth/(providers)/googleOAuth.svelte';
import Main from '$routes/(console)/project-[project]/auth/(providers)/mainOAuth.svelte';
import Microsoft from '$routes/(console)/project-[project]/auth/(providers)/microsoftOAuth.svelte';
import Oidc from '$routes/(console)/project-[project]/auth/(providers)/oidcOAuth.svelte';
import Okta from '$routes/(console)/project-[project]/auth/(providers)/oktaOAuth.svelte';
import type { SvelteComponent } from 'svelte';

export type Provider = {
    name: string;
    icon: string;
    docs?: string;
    component: typeof SvelteComponent<unknown>;
};

export const oAuthProviders: Record<string, Provider> = {
    amazon: {
        name: 'Amazon',
        icon: 'amazon',
        docs: 'https://developer.amazon.com/apps-and-games/services-and-apis',
        component: Main
    },
    apple: {
        name: 'Apple',
        icon: 'apple',
        docs: 'https://developer.apple.com/',
        component: Apple
    },
    auth0: {
        name: 'Auth0',
        icon: 'auth0',
        docs: 'https://auth0.com/developers',
        component: Auth0
    },
    authentik: {
        name: 'Authentik',
        icon: 'authentik',
        docs: 'https://goauthentik.io/integrations/sources/oauth/',
        component: Authentik
    },
    autodesk: {
        name: 'Autodesk',
        icon: 'autodesk',
        docs: 'https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/overview/',
        component: Main
    },
    bitbucket: {
        name: 'Bitbucket',
        icon: 'bitbucket',
        docs: 'https://developer.atlassian.com/bitbucket',
        component: Main
    },
    bitly: {
        name: 'Bitly',
        icon: 'bitly',
        docs: 'https://dev.bitly.com/v4_documentation.html',
        component: Main
    },
    box: {
        name: 'Box',
        icon: 'box',
        docs: 'https://developer.box.com/reference/',
        component: Main
    },
    dailymotion: {
        name: 'Dailymotion',
        icon: 'dailymotion',
        docs: 'https://developers.dailymotion.com/api/',
        component: Main
    },
    discord: {
        name: 'Discord',
        icon: 'discord',
        docs: 'https://discordapp.com/developers/docs/topics/oauth2',
        component: Main
    },
    disqus: {
        name: 'Disqus',
        icon: 'disqus',
        docs: 'https://disqus.com/api/docs/auth/',
        component: Main
    },
    dropbox: {
        name: 'Dropbox',
        icon: 'dropbox',
        docs: 'https://www.dropbox.com/developers/documentation',
        component: Main
    },
    etsy: {
        name: 'Etsy',
        icon: 'etsy',
        docs: 'https://developers.etsy.com/',
        component: Main
    },
    facebook: {
        name: 'Facebook',
        icon: 'facebook',
        docs: 'https://developers.facebook.com/',
        component: Main
    },
    figma: {
        name: 'Figma',
        icon: 'figma',
        docs: 'https://www.figma.com/developers/api#access-tokens',
        component: Main
    },
    github: {
        name: 'GitHub',
        icon: 'github',
        docs: 'https://developer.github.com',
        component: Main
    },
    gitlab: {
        name: 'GitLab',
        icon: 'gitlab',
        docs: 'https://docs.gitlab.com/ee/api/',
        component: GitLab
    },
    google: {
        name: 'Google',
        icon: 'google',
        docs: 'https://support.google.com/googleapi/answer/6158849',
        component: Google
    },
    linkedin: {
        name: 'LinkedIn',
        icon: 'linkedin',
        docs: 'https://developer.linkedin.com/',
        component: Main
    },
    microsoft: {
        name: 'Microsoft',
        icon: 'microsoft',
        docs: 'https://developer.microsoft.com/en-us/',
        component: Microsoft
    },
    notion: {
        name: 'Notion',
        icon: 'notion',
        docs: 'https://developers.notion.com/docs',
        component: Main
    },
    oidc: {
        name: 'OIDC',
        icon: 'oidc',
        docs: 'https://openid.net/connect/faq/',
        component: Oidc
    },
    okta: {
        name: 'Okta',
        icon: 'okta',
        docs: 'https://developer.okta.com',
        component: Okta
    },
    paypal: {
        name: 'Paypal',
        icon: 'paypal',
        docs: 'https://developer.paypal.com/docs/api/overview/',
        component: Main
    },
    paypalsandbox: {
        name: 'Paypal Sandbox',
        icon: 'paypal',
        docs: 'https://developer.paypal.com/docs/api/overview/',
        component: Main
    },
    podio: {
        name: 'Podio',
        icon: 'podio',
        docs: 'https://developers.podio.com/doc/oauth-authorization',
        component: Main
    },
    salesforce: {
        name: 'Salesforce',
        icon: 'salesforce',
        docs: 'https://developer.salesforce.com/docs/',
        component: Main
    },
    slack: {
        name: 'Slack',
        icon: 'slack',
        docs: 'https://api.slack.com/',
        component: Main
    },
    spotify: {
        name: 'Spotify',
        icon: 'spotify',
        docs: 'https://developer.spotify.com/documentation/general/guides/authorization-guide/',
        component: Main
    },
    stripe: {
        name: 'Stripe',
        icon: 'stripe',
        docs: 'https://stripe.com/docs/api',
        component: Main
    },
    tradeshift: {
        name: 'Tradeshift',
        icon: 'tradeshift',
        docs: 'https://developers.tradeshift.com/docs/api',
        component: Main
    },
    tradeshiftBox: {
        name: 'Tradeshift Sandbox',
        icon: 'tradeshift',
        docs: 'https://developers.tradeshift.com/docs/api',
        component: Main
    },
    twitch: {
        name: 'Twitch',
        icon: 'twitch',
        docs: 'https://dev.twitch.tv/docs/auth',
        component: Main
    },
    wordpress: {
        name: 'Wordpress',
        icon: 'wordpress',
        docs: 'https://developer.wordpress.com/docs/oauth2/',
        component: Main
    },
    yahoo: {
        name: 'Yahoo',
        icon: 'yahoo',
        docs: 'https://developer.yahoo.com/oauth2/guide/flows_authcode/',
        component: Main
    },
    yammer: {
        name: 'Yammer',
        icon: 'yammer',
        docs: 'https://developer.yammer.com/docs/oauth-2',
        component: Main
    },
    yandex: {
        name: 'Yandex',
        icon: 'yandex',
        docs: 'https://tech.yandex.com/oauth/',
        component: Main
    },
    zoho: {
        name: 'Zoho',
        icon: 'zoho',
        docs: 'https://www.zoho.com/crm/developer/docs/api/oauth-overview.html',
        component: Main
    },
    zoom: {
        name: 'Zoom',
        icon: 'zoom',
        docs: 'https://marketplace.zoom.us/docs/guides/auth/oauth/',
        component: Main
    }
};
