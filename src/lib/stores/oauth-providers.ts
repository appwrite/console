import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';
import type { SvelteComponent } from 'svelte';
import Apple from '../../routes/console/project-[project]/authentication/_appleOAuth.svelte';
import Microsoft from '../../routes/console/project-[project]/authentication/_microsoftOAuth.svelte';
import Okta from '../../routes/console/project-[project]/authentication/_oktaOAuth.svelte';
import Auth0 from '../../routes/console/project-[project]/authentication/_auth0OAuth.svelte';
import Main from '../../routes/console/project-[project]/authentication/_mainOAuth.svelte';

export type Provider = Models.Provider & {
    icon: string;
    docs?: string;
    component?: typeof SvelteComponent;
};

export type Providers = {
    providers: Provider[];
};

const setProviders = (project: Models.Project): Provider[] => {
    return (
        project?.providers.map((n) => {
            let docs: Provider['docs'];
            let icon: Provider['icon'] = n.name.toLowerCase();
            let component: Provider['component'] = Main;

            switch (n.name.toLowerCase()) {
                case 'amazon':
                    docs = 'https://developer.amazon.com/apps-and-games/services-and-apis';
                    break;
                case 'apple':
                    docs = 'https://developer.apple.com/';
                    component = Apple;
                    break;
                case 'auth0':
                    docs = 'https://auth0.com/developers';
                    component = Auth0;
                    break;
                case 'bitbucket':
                    docs = 'https://developer.atlassian.com/bitbucket';
                    break;
                case 'bitly':
                    docs = 'https://dev.bitly.com/v4_documentation.html';
                    break;
                case 'box':
                    docs = 'https://developer.box.com/reference/';
                    break;
                case 'discord':
                    docs = 'https://discordapp.com/developers/docs/topics/oauth2';
                    break;
                case 'dropbox':
                    docs = 'https://www.dropbox.com/developers/documentation';
                    break;
                case 'facebook':
                    docs = 'https://developers.facebook.com/';
                    break;
                case 'github':
                    docs = 'https://developer.github.com';
                    break;
                case 'gitlab':
                    docs = 'https://docs.gitlab.com/ee/api/';
                    break;
                case 'google':
                    docs = 'https://support.google.com/googleapi/answer/6158849';
                    break;
                case 'linkedin':
                    docs = 'https://developer.linkedin.com/';
                    break;
                case 'microsoft':
                    docs = 'https://developer.microsoft.com/en-us/';
                    component = Microsoft;
                    break;
                case 'notion':
                    docs = 'https://developers.notion.com/docs';
                    break;
                case 'okta':
                    docs = 'https://developer.okta.com';
                    component = Okta;
                    break;
                case 'paypal':
                    docs = 'https://developer.paypal.com/docs/api/overview/';
                    break;
                case 'paypalsandbox':
                    icon = 'paypal';
                    docs = 'https://developer.paypal.com/docs/api/overview/';
                    break;
                case 'salesforce':
                    docs = 'https://developer.salesforce.com/docs/';
                    break;
                case 'slack':
                    docs = 'https://api.slack.com/';
                    break;
                case 'spotify':
                    docs =
                        'https://developer.spotify.com/documentation/general/guides/authorization-guide/';
                    break;
                case 'stripe':
                    docs = 'https://stripe.com/docs/api';
                    break;
                case 'tradeshift':
                    docs = 'https://developers.tradeshift.com/docs/api';
                    break;
                case 'tradeshiftbox':
                    icon = 'tradeshift';
                    docs = 'https://developers.tradeshift.com/docs/api';
                    break;
                case 'twitch':
                    docs = 'https://dev.twitch.tv/docs/authentication';
                    break;
                case 'wordpress':
                    docs = 'https://developer.wordpress.com/docs/oauth2/';
                    break;
                case 'yahoo':
                    docs = 'https://developer.yahoo.com/oauth2/guide/flows_authcode/';
                    break;
                case 'yammer':
                    docs = 'https://developer.yammer.com/docs/oauth-2';
                    break;
                case 'yandex':
                    docs = 'https://tech.yandex.com/oauth/';
                    break;
                case 'zoom':
                    docs = 'https://marketplace.zoom.us/docs/guides/auth/oauth/';
                    break;
                default:
                    break;
            }

            return {
                ...n,
                icon,
                docs,
                component
            };
        }) ?? []
    );
};

function createOAuthProviders() {
    const { subscribe, set } = writable<Providers>({
        providers: setProviders(null)
    });
    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            const providers = setProviders(project);

            set({ providers });
        }
    };
}

export const OAuthProviders = createOAuthProviders();
